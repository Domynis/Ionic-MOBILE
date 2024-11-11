import { Camera, CameraResultType, CameraSource, Photo } from "@capacitor/camera";
import { Filesystem, Directory } from "@capacitor/filesystem";
import axios from "axios";

// Function to take a photo using the Camera
export async function takePhoto(imageTitle?: string): Promise<MyPhoto | null> {
    try {
        const photo = await Camera.getPhoto({
            resultType: CameraResultType.Uri,
            source: CameraSource.Camera,
            quality: 100,
        });

        if (!photo) {
            return null;
        }

        // Save the photo to the file system and retrieve file path
        const savedFile = await savePhoto(photo, imageTitle);

        // Return the MyPhoto object with both webviewPath and filepath
        return {
            filepath: savedFile.filepath,
            webviewPath: photo.webPath, // This path is viewable in web context
        };
    } catch (error) {
        console.error("Error taking photo:", error);
        return null;
    }
}

async function savePhoto(photo: Photo, imageTitle?: string): Promise<{ filepath: string }> {
    // Convert photo to base64 for saving
    const response = await fetch(photo.webPath!);
    const blob = await response.blob();
    const base64Data = await convertBlobToBase64(blob) as string;

    // Generate a filename and save the photo
    const cleanedTitle = imageTitle ? imageTitle.replace(/[^a-zA-Z0-9_]/g, '') : '';
    const fileName = cleanedTitle ? cleanedTitle + ".jpeg" : new Date().getTime() + '.jpeg';
    const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Data,
    });

    // if uri is "/DATA/1731163994676.jpeg" take only the filename
    const uri = savedFile.uri.split('/')[2];
    return {
        filepath: uri,
    };
}

export interface MyPhoto {
    filepath: string;
    webviewPath?: string;
}

export async function getWebviewPathFromFilesystem(filepath: string, fileFormat: string = "jpeg"): Promise<string | undefined> {
    try {
        // Read the file content to convert to a base64 data URL for the image
        const result = await Filesystem.readFile({
            path: filepath,
            directory: Directory.Data,
        });

        // Convert the file content to a data URL to display in a webview
        const base64Data = result.data;
        return `data:image/` + fileFormat + `;base64,${base64Data}`;
    } catch (error) {
        // console.error('Error reading file from filesystem', error);
        return undefined;
    }
}

export const getImageBlobUrl = async (url: string, token: string) => {
    try {
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            responseType: 'blob'
        });

        return URL.createObjectURL(response.data);
    } catch (error) {
        console.error("Error fetching image with token:", error);
        return undefined;
    }
};

export async function getWebviewPath(photoUrl: string, photoUrlBE: string | undefined, token: string) {
    let webviewPath = !photoUrl.includes("http") ? await getWebviewPathFromFilesystem(photoUrl, "jpeg")
        : await getImageBlobUrl(photoUrl, token);
    if (webviewPath === undefined && photoUrlBE) {
        webviewPath = await getImageBlobUrl(photoUrlBE, token);
    }
    return webviewPath;
}

// Helper function to convert a Blob to Base64
const convertBlobToBase64 = (blob: Blob): Promise<string | ArrayBuffer | null> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = () => {
            resolve(reader.result);
        };
        reader.readAsDataURL(blob);
    });
};