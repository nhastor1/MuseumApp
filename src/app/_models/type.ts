export enum Type {
    text = "text",
    number = "number",
    description = "textarea",
    dateTimeType = "datetime-local",
    dateType = "date",
    imageType = "image",
    videoType = "video",
    audioType = "audio",
    create = "datetime-local",
    edit = "datetime-local"
}

export class FileList {
    files = ["image", "video", "audio"];

    isFile(type){
        return this.files.includes(type);
    }
}