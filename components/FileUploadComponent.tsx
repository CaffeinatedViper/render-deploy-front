import { ChangeEvent, useState } from "react"
import { fetchService } from "../services/fetchService";
import { UUID } from "crypto";

export type FileInputComponentProps = {
    gotFileIDCallback : (fileID:UUID) => void
}

export const FileInputComponent = (props:FileInputComponentProps) => {
    const {gotFileIDCallback} = props;

    const [file,setFile] = useState<File>(null);
    const [inputKey,setInputKey] = useState(Date.now());

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => e.target.files && setFile(e.target.files[0]);
    const clearFile = () => {
        setFile(null);
        gotFileIDCallback(null);
        setInputKey(Date.now());    
    }

    const handleUploadClick = () => file && fetchService.uploadFile(file).then(rs => gotFileIDCallback(rs.id));

    return (<div className="fileInputContainer">
        <input type="file" key={inputKey} onChange={handleFileChange}/>

        <button onClick={handleUploadClick}>Upload</button>
        <button onClick={clearFile}>Clear</button>
    </div>)
}