import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, tap, switchMap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SpotifyService {
  private CLIENT_ID = environment.SPOTIFY_CLIENT_ID;
  private CLIENT_SECRET = environment.SPOTIFY_CLIENT_SECRET;
  private TOKEN_URL = 'https://accounts.spotify.com/api/token';
  private API_URL = 'https://api.spotify.com/v1';
  private accessToken: string | null = null;

  constructor(private http: HttpClient) {}

  private getAccessToken(): Observable<string> {
    const body = new HttpParams().set('grant_type', 'client_credentials');

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${btoa(`${this.CLIENT_ID}:${this.CLIENT_SECRET}`)}`,
    });

    return this.http
      .post<{ access_token: string }>(this.TOKEN_URL, body.toString(), {
        headers,
      })
      .pipe(
        tap((res) => (this.accessToken = res.access_token)),
        switchMap((res) =>
          res.access_token
            ? [res.access_token]
            : throwError(() => new Error("Erreur d'authentification"))
        )
      );
  }

  public fetchAlbums(): Observable<any> {
    if (!this.accessToken) {
      return this.getAccessToken().pipe(switchMap(() => this.getAlbums()));
    }
    return this.getAlbums();
  }

  private getAlbums(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.accessToken}`,
    });

    return this.http
      .get<any>(`${this.API_URL}/browse/new-releases?limit=50`, { headers })
      .pipe(
        tap((response) => console.log('Albums récupérés:', response)),
        switchMap((res) =>
          res.albums?.items
            ? [res.albums.items.map(this.formatAlbum)]
            : throwError(() => new Error('Aucun album trouvé'))
        )
      );
  }

  public fetchAlbumDetails(albumId: string): Observable<any> {
    if (!this.accessToken) {
      return this.getAccessToken().pipe(
        switchMap(() => this.getAlbumDetails(albumId))
      );
    }
    return this.getAlbumDetails(albumId);
  }

  private getAlbumDetails(albumId: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.accessToken}`,
    });

    return this.http
      .get<any>(`${this.API_URL}/albums/${albumId}`, { headers })
      .pipe(
        tap((response) => console.log("Détails de l'album:", response)),
        switchMap((res) =>
          res
            ? [this.formatAlbumDetails(res)]
            : throwError(() => new Error('Album non trouvé'))
        )
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
    };
  }

  private formatAlbumDetails(album: any) {
    return {
      id: album.id,
      title: album.name,
      author: album.artists.map((artist: any) => artist.name).join(', '),
      createdDate: album.release_date,
      price: SpotifyService.generatePriceFromId(album.id),
      style: 'Album',
      imageUrl: album.images[0]?.url || '',
      tracks: album.tracks.items.map((track: any) => ({
        trackId: track.id,
        trackName: track.name,
        trackDuration: track.duration_ms,
        trackPreviewUrl: track.preview_url,
      })),
    };
  }

  private static generatePriceFromId(id: string): string {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return (Math.abs(hash % 90) + 10).toFixed(2);
  }
}
