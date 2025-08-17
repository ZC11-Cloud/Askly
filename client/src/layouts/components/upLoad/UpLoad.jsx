import { IKContext, IKUpload } from "imagekitio-react";
import { useRef, useState } from "react";

const urlEndpoint = import.meta.env.VITE_IMAGE_KIT_ENDPOINT;
const publicKey = import.meta.env.VITE_IMAGE_KIT_PUBLIC_KEY;

const authenticator = async () => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`);
  if (!res.ok) throw new Error("Auth failed");
  return res.json();
};

const Upload = ({ setImg }) => {
  const ikUploadRef = useRef(null);
  const [progress, setProgress] = useState(0);

  const onError = (err) => {
    console.error("Upload Error:", err);
    setImg(prev => ({ ...prev, isLoading: false, error: "上传失败" }));
  };

  const onSuccess = (res) => {
    console.log("Upload Success:", res);
    setImg(prev => ({
      ...prev,
      isLoading: false,
      dbData: res,
    }));
    setProgress(0);
  };

  const onUploadProgress = (progress) => {
    const percent = Math.round((progress.loaded / progress.total) * 100);
    setProgress(percent);
  };

  const onUploadStart = (evt) => {
    const file = evt.target.files[0];
    if (!file) return;

    // 限制大小 10MB
    if (file.size > 10 * 1024 * 1024) {
      alert("文件不能超过 10MB");
      return;
    }

    // 限制类型
    const allowedTypes = ["image/png", "image/jpeg", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      alert("不支持的文件类型");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImg(prev => ({
        ...prev,
        isLoading: true,
        aiData: {
          inlineData: {
            data: reader.result.split(",")[1],
            mimeType: file.type,
          },
        },
      }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <IKContext
      urlEndpoint={urlEndpoint}
      publicKey={publicKey}
      authenticator={authenticator}
    >
      <IKUpload
        ref={ikUploadRef}
        fileName="upload-file"
        useUniqueFileName={true}
        onError={onError}
        onSuccess={onSuccess}
        onUploadProgress={onUploadProgress}
        onUploadStart={onUploadStart}
        accept="image/*,application/pdf"
        multiple={true}
        style={{ display: "none" }}
      />
      <label onClick={() => ikUploadRef.current.click()}>
        <img src="/attachment.png" alt="上传文件" />
      </label>
      {progress > 0 && (
        <div style={{ fontSize: "12px", color: "#666" }}>
          上传进度: {progress}%
        </div>
      )}
    </IKContext>
  );
};

export default Upload;
