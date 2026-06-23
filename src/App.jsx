import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function App() {
  const [videos, setVideos] = useState([]);
  const [uploading, setUploading] = useState(false);

  async function carregarVideos() {
    const { data, error } = await supabase
      .from("videos")
      .select("*")
      .order("id", { ascending: false });

    if (!error) {
      setVideos(data || []);
    }
  }

  async function uploadVideo(e) {
    const file = e.target.files[0];

    if (!file) return;

    setUploading(true);

    const fileName = `${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("videos")
      .upload(fileName, file);

    if (uploadError) {
      alert(uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage
      .from("videos")
      .getPublicUrl(fileName);

    const { error: insertError } = await supabase
      .from("videos")
      .insert({
        nome: file.name,
        url: data.publicUrl,
      });

    if (insertError) {
      alert(insertError.message);
    } else {
      carregarVideos();
    }

    setUploading(false);
  }

  useEffect(() => {
    carregarVideos();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Galeria de Vídeos</h1>

      <input
        type="file"
        accept="video/*"
        onChange={uploadVideo}
      />

      {uploading && <p>Enviando vídeo...</p>}

      <hr />

      {videos.map((video) => (
        <div key={video.id} style={{ marginBottom: "20px" }}>
          <h3>{video.nome}</h3>

          <video
            src={video.url}
            controls
            width="600"
          />
        </div>
      ))}
    </div>
  );
}