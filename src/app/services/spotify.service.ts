import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of, throwError, switchMap, catchError, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Product } from '../interfaces/product';
@Injectable({
  providedIn: 'root',
})
export class SpotifyService {
  private CLIENT_ID = environment.SPOTIFY_CLIENT_ID;
  private CLIENT_SECRET = environment.SPOTIFY_CLIENT_SECRET;
  private TOKEN_URL = 'https://accounts.spotify.com/api/token';
  private API_URL = 'https://api.spotify.com/v1';
  private accessToken: string | null = null;

  constructor(private http: HttpClient) { }

  private getAccessToken(): Observable<string> {
    const body = new HttpParams().set('grant_type', 'client_credentials');
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${btoa(`${this.CLIENT_ID}:${this.CLIENT_SECRET}`)}`,
    });

    return this.http
      .post<{ access_token: string }>(this.TOKEN_URL, body.toString(), { headers })
      .pipe(
        tap((res) => (this.accessToken = res.access_token)),
        switchMap((res) =>
          res.access_token ? of(res.access_token) : throwError(() => new Error("Erreur d'authentification"))
        )
      );
  }

  public fetchAlbums(): Observable<Product[]> {
    if (!this.accessToken) {
      return this.getAccessToken().pipe(switchMap(() => this.getAlbums()));
    }
    return this.getAlbums();
  }

  private getAlbums(): Observable<Product[]> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.accessToken}`,
    });

    return this.http
      .get<any>(`${this.API_URL}/browse/new-releases?limit=50`, { headers })
      .pipe(
        tap((response) => console.log('Albums récupérés:', response)),
        switchMap((res) =>
          res.albums?.items
            ? of(res.albums.items.map(this.formatAlbum))
            : throwError(() => new Error('Aucun album trouvé'))
        ),
        catchError((error) => {
          console.error('Erreur lors de la récupération des albums:', error);
          return throwError(() => new Error('Erreur lors de la récupération des albums'));
        })
      );
  }
  private formatAlbum(album: any) {
    return {
      id: album.id,
      title: album.name,
      author: album.artists.map((artist: any) => artist.name).join(', '),
      createdDate: album.release_date,
      price: SpotifyService.generatePriceFromId(album.id),
      style: 'Album',
      imageUrl: album.images[0]?.url || '',
      artists: album.artists.map((artist: any) => ({
        name: artist.name,
        profileUrl: artist.external_urls?.spotify || '',
      })),
    };
  }

  public fetchAlbumDetails(albumId: string): Observable<Product> {
    if (!this.accessToken) {
      return this.getAccessToken().pipe(switchMap(() => this.getAlbumDetails(albumId)));
    }
    return this.getAlbumDetails(albumId);
  }

  private getAlbumDetails(albumId: string): Observable<Product> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.accessToken}`,
    });

    return this.http
      .get<any>(`${this.API_URL}/albums/${albumId}`, { headers })
      .pipe(
        tap((response) => console.log("Détails de l'album:", response)),
        switchMap((res) =>
          res
            ? this.addGenresToAlbumDetails(res)
            : throwError(() => new Error('Album non trouvé'))
        ),
        catchError((error) => {
          console.error('Erreur lors de la récupération des détails de l\'album:', error);
          return throwError(() => new Error("Erreur lors de la récupération des détails de l'album"));
        })
      );
  }

  private addGenresToAlbumDetails(album: any): Observable<Product> {
    return new Observable<Product>((observer) => {
      Promise.all(
        album.artists.map((artist: any) =>
          this.fetchArtistGenres(artist.id).catch(() => 'Genre inconnu')
        )
      )
        .then((genres) => {
          const tracks = album.tracks.items.map((track: any) => ({
            trackId: track.id,
            trackName: track.name,
            trackDuration: track.duration_ms,
            trackPreviewUrl: track.preview_url,
          }));

          observer.next({
            id: album.id,
            title: album.name,
            author: album.artists.map((artist: any) => artist.name).join(', '),
            createdDate: album.release_date,
            price: SpotifyService.generatePriceFromId(album.id),
            quantity: 1,
            isFavorite: false,
            style: genres.join(', '),
            imageUrl: album.images[0]?.url || '',
            artists: album.artists.map((artist: any) => ({
              name: artist.name,
              profileUrl: artist.external_urls?.spotify || '',
            })),
            tracks,
          });
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  public fetchSuggestionsByGenre(genre: string): Observable<Product[]> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.accessToken}`,
    });

    const params = new HttpParams().set('genre', genre).set('limit', '10');

    return this.http
      .get<any>(`${this.API_URL}/browse/new-releases`, { headers, params })
      .pipe(
        tap((response) => console.log('Suggestions récupérées:', response)),
        switchMap((res) =>
          res.albums?.items
            ? of(res.albums.items.map(this.formatAlbum))
            : throwError(() => new Error('Aucune suggestion trouvée'))
        ),
        catchError((error) => {
          console.error('Erreur lors de la récupération des suggestions:', error);
          return throwError(() => new Error('Erreur lors de la récupération des suggestions'));
        })
      );
  }

  private fetchArtistGenres(artistId: string): Promise<string> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.accessToken}`,
    });

    return this.http
      .get<any>(`${this.API_URL}/artists/${artistId}`, { headers })
      .pipe(
        tap((response) => console.log('Genres récupérés pour l\'artiste:', response)),
        switchMap((res) =>
          res ? of(res.genres.join(', ')) : throwError(() => new Error('Genres introuvables'))
        ),
        catchError((error) => {
          console.error(`Erreur lors de la récupération des genres de l'artiste ${artistId}`, error.message);
          return of('Genre inconnu');
        })
      )
      .toPromise();
  }

  private static generatePriceFromId(id: string): number {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash % 90) + 10;
  }
}
