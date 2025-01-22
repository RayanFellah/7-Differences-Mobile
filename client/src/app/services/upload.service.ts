import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import imageCompression from 'browser-image-compression';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UploadService {
  constructor(private http: HttpClient) {}

  async compressImage(file: File): Promise<File> {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    try {
      return await imageCompression(file, options);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  uploadImage(imageFile: File, username: string) {
    const formData = new FormData();
    formData.append('file', imageFile, username + '.jpg');
        return this.http.post(`${environment.serverUrlAndPort}/api/fs/players/${username}/avatarUpload`, formData, { responseType: 'text' });
  }
}
