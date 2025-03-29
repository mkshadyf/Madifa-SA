import Vimeo from '@vimeo/vimeo';
import { ContentItem } from '@shared/types';

// Initialize Vimeo client with credentials from environment variables
const vimeoClient = new Vimeo.Vimeo(
  process.env.VIMEO_API_KEY as string,
  process.env.VIMEO_API_SECRET as string,
  process.env.VIMEO_ACCESS_TOKEN as string
);

export interface VimeoVideoDetails {
  id: string;
  title: string;
  description: string;
  duration: number;
  thumbnailUrl: string;
  videoUrl: string;
  streamingUrl: string;
  privacySettings: {
    view: string;
    embed: string;
    download: boolean;
    add: boolean;
  };
}

export interface VimeoUploadOptions {
  name: string;
  description?: string;
  privacy?: {
    view: 'anybody' | 'nobody' | 'password' | 'disable' | 'unlisted';
    embed: 'public' | 'private' | 'whitelist';
    download: boolean;
    add: boolean;
  };
  folder_id?: number;
}

export class VimeoService {
  /**
   * Get details about a specific video by its ID
   */
  static async getVideoDetails(videoId: string): Promise<VimeoVideoDetails> {
    return new Promise((resolve, reject) => {
      vimeoClient.request({
        method: 'GET',
        path: `/videos/${videoId}`
      }, (error, body) => {
        if (error) {
          console.error('Vimeo API error:', error);
          reject(error);
          return;
        }

        const details: VimeoVideoDetails = {
          id: body.uri.split('/').pop(),
          title: body.name,
          description: body.description || '',
          duration: body.duration,
          thumbnailUrl: body.pictures.sizes[3].link,
          videoUrl: `https://vimeo.com/${body.uri.split('/').pop()}`,
          streamingUrl: body.player_embed_url,
          privacySettings: {
            view: body.privacy.view,
            embed: body.privacy.embed,
            download: body.privacy.download,
            add: body.privacy.add
          }
        };

        resolve(details);
      });
    });
  }

  /**
   * Get all videos from the account
   */
  static async getAllVideos(page: number = 1, perPage: number = 25): Promise<{videos: VimeoVideoDetails[], total: number, page: number, perPage: number}> {
    return new Promise((resolve, reject) => {
      vimeoClient.request({
        method: 'GET',
        path: '/me/videos',
        query: {
          page,
          per_page: perPage
        }
      }, (error, body) => {
        if (error) {
          console.error('Vimeo API error:', error);
          reject(error);
          return;
        }

        const videos = body.data.map((video: any) => ({
          id: video.uri.split('/').pop(),
          title: video.name,
          description: video.description || '',
          duration: video.duration,
          thumbnailUrl: video.pictures.sizes[3].link,
          videoUrl: `https://vimeo.com/${video.uri.split('/').pop()}`,
          streamingUrl: video.player_embed_url,
          privacySettings: {
            view: video.privacy.view,
            embed: video.privacy.embed,
            download: video.privacy.download,
            add: video.privacy.add
          }
        }));

        resolve({
          videos,
          total: body.total,
          page: body.page,
          perPage: body.per_page
        });
      });
    });
  }

  /**
   * Upload a video to Vimeo
   * fileUrl can be a local file path or a URL
   */
  static async uploadVideo(fileUrl: string, options: VimeoUploadOptions): Promise<string> {
    return new Promise((resolve, reject) => {
      vimeoClient.upload(
        fileUrl,
        {
          name: options.name,
          description: options.description,
          privacy: options.privacy,
          folder_id: options.folder_id
        },
        (uri) => {
          // The upload was successful
          console.log('Video uploaded to Vimeo:', uri);
          const videoId = uri.split('/').pop();
          resolve(videoId as string);
        },
        (bytesUploaded, bytesTotal) => {
          // Progress callback
          const percentage = Math.round((bytesUploaded / bytesTotal) * 100);
          console.log(`Upload progress: ${percentage}%`);
        },
        (error) => {
          // Error callback
          console.error('Failed to upload video to Vimeo:', error);
          reject(error);
        }
      );
    });
  }

  /**
   * Update video details
   */
  static async updateVideo(videoId: string, options: Partial<VimeoUploadOptions>): Promise<boolean> {
    return new Promise((resolve, reject) => {
      vimeoClient.request({
        method: 'PATCH',
        path: `/videos/${videoId}`,
        query: options
      }, (error) => {
        if (error) {
          console.error('Failed to update video on Vimeo:', error);
          reject(error);
          return;
        }
        resolve(true);
      });
    });
  }

  /**
   * Delete a video from Vimeo
   */
  static async deleteVideo(videoId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      vimeoClient.request({
        method: 'DELETE',
        path: `/videos/${videoId}`
      }, (error) => {
        if (error) {
          console.error('Failed to delete video from Vimeo:', error);
          reject(error);
          return;
        }
        resolve(true);
      });
    });
  }

  /**
   * Get embed HTML for video
   */
  static getEmbedHtml(videoId: string, options: {
    width?: number;
    height?: number;
    autoplay?: boolean;
    loop?: boolean;
    title?: boolean;
    byline?: boolean;
    portrait?: boolean;
    speed?: boolean;
    transparent?: boolean;
  } = {}): string {
    const defaultOptions = {
      width: 640,
      height: 360,
      autoplay: false,
      loop: false,
      title: true,
      byline: true,
      portrait: true,
      speed: true,
      transparent: true
    };

    const settings = { ...defaultOptions, ...options };
    const queryParams = new URLSearchParams({
      autoplay: settings.autoplay ? '1' : '0',
      loop: settings.loop ? '1' : '0',
      title: settings.title ? '1' : '0',
      byline: settings.byline ? '1' : '0',
      portrait: settings.portrait ? '1' : '0',
      speed: settings.speed ? '1' : '0',
      transparent: settings.transparent ? '1' : '0'
    }).toString();

    return `<iframe src="https://player.vimeo.com/video/${videoId}?${queryParams}" width="${settings.width}" height="${settings.height}" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
  }

  /**
   * Convert a Vimeo video to ContentItem format
   */
  static convertToContentItem(
    video: VimeoVideoDetails, 
    categoryId: number = 1, 
    isPremium: boolean = false, 
    contentType: 'movie' | 'series' | 'music_video' | 'trailer' = 'movie'
  ): Partial<ContentItem> {
    return {
      title: video.title,
      description: video.description,
      thumbnailUrl: video.thumbnailUrl,
      videoUrl: video.streamingUrl,
      trailerUrl: video.streamingUrl, // In a real implementation, this would be different
      releaseYear: new Date().getFullYear(),
      duration: Math.floor(video.duration),
      isPremium,
      categoryId,
      contentType: contentType
    };
  }

  /**
   * Get captions/subtitles for a video
   */
  static async getVideoCaptions(videoId: string): Promise<Array<{
    uri: string;
    active: boolean;
    language: string;
    link: string;
    name: string;
    type: string;
  }>> {
    return new Promise((resolve, reject) => {
      vimeoClient.request({
        method: 'GET',
        path: `/videos/${videoId}/texttracks`
      }, (error, body) => {
        if (error) {
          console.error('Failed to get video captions from Vimeo:', error);
          reject(error);
          return;
        }
        resolve(body.data);
      });
    });
  }

  /**
   * Add a caption/subtitle track to a video
   */
  static async addVideoCaption(
    videoId: string, 
    language: string, 
    name: string, 
    fileUrl: string, 
    type: 'subtitles' | 'captions' = 'subtitles'
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      vimeoClient.request({
        method: 'POST',
        path: `/videos/${videoId}/texttracks`,
        query: {
          type,
          language,
          name
        }
      }, (error, body) => {
        if (error) {
          console.error('Failed to add texttrack to Vimeo video:', error);
          reject(error);
          return;
        }

        // Upload the actual subtitle file to the texttrack
        vimeoClient.request({
          method: 'PUT',
          path: body.link,
          headers: {
            'Content-Type': 'text/plain'
          },
          body: fileUrl
        }, (uploadError) => {
          if (uploadError) {
            console.error('Failed to upload texttrack file to Vimeo:', uploadError);
            reject(uploadError);
            return;
          }
          resolve(body.uri);
        });
      });
    });
  }

  /**
   * Check if the Vimeo client is properly authenticated
   */
  static async checkAuthentication(): Promise<{authenticated: boolean, user?: any}> {
    return new Promise((resolve) => {
      vimeoClient.request({
        method: 'GET',
        path: '/me'
      }, (error, body) => {
        if (error) {
          console.error('Vimeo authentication check failed:', error);
          resolve({authenticated: false});
          return;
        }
        resolve({
          authenticated: true,
          user: {
            name: body.name,
            uri: body.uri,
            account: body.account
          }
        });
      });
    });
  }
  
  /**
   * Update caption/subtitle track properties (e.g., set as active/default)
   */
  static async updateVideoCaption(
    videoId: string,
    captionId: string,
    active: boolean = false
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      vimeoClient.request({
        method: 'PATCH',
        path: `/videos/${videoId}/texttracks/${captionId}`,
        query: {
          active: active
        }
      }, (error, body) => {
        if (error) {
          console.error('Failed to update caption track:', error);
          reject(error);
          return;
        }
        resolve(true);
      });
    });
  }
  
  /**
   * Delete caption/subtitle track
   */
  static async deleteVideoCaption(
    videoId: string,
    captionId: string
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      vimeoClient.request({
        method: 'DELETE',
        path: `/videos/${videoId}/texttracks/${captionId}`
      }, (error, body) => {
        if (error) {
          console.error('Failed to delete caption track:', error);
          reject(error);
          return;
        }
        resolve(true);
      });
    });
  }
}