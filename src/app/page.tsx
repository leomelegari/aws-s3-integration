"use client";

import { Paperclip, Trash2 } from "lucide-react";
import Image from "next/image";
import { ChangeEvent, FormEvent, useState } from "react";
import { getSignedURL } from "./actions";
import { toast } from "@/components/ui/use-toast";

export default function Home() {
  const [file, setFile] = useState<File | undefined>(undefined);
  const [fileUrl, setFileUrl] = useState<string | undefined>(undefined);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      toast({
        title: "Uploading file...",
        description: "Please wait while the file is being uploaded!",
        variant: "default",
      });
      if (file) {
        const signedURLResult = await getSignedURL();
        if (signedURLResult.failure !== undefined) {
          console.error("Error");
          return;
        }
        const url = signedURLResult.success.url;

        await fetch(url, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type,
          },
        });

        console.log("File", file);
      }
    } catch (error) {
      toast({
        title: "Uhh... Something went wrong",
        description: "Please try again!",
        variant: "destructive",
      });
    } finally {
      toast({
        title: "Done! ✅",
        description: "File successfully uploaded.",
        variant: "default",
      });
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFile(file);

    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
    }

    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);
    } else {
      setFileUrl(undefined);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <form onSubmit={handleSubmit}>
        <label className="flex cursor-pointer gap-4">
          Attach media
          <Paperclip className="h-5 w-5" />
          <input
            type="file"
            name="media"
            accept="image/jpg,image/png,image/jpeg,video/mp4"
            className="hidden flex-1 border-none bg-transparent outline-none"
            onChange={handleChange}
          />
        </label>
        <button type="submit">POST!</button>
      </form>
      {fileUrl && file && (
        <div className="flex items-center gap-4">
          {file.type.startsWith("image/") ? (
            <div className="relative h-32 w-32 overflow-hidden rounded-lg">
              <Image
                className="object-cover"
                src={fileUrl}
                alt={file.name}
                priority={true}
                fill={true}
              />
            </div>
          ) : (
            <div className="relative h-fit w-32 overflow-hidden rounded-lg">
              <video
                className="object-cover"
                src={fileUrl}
                autoPlay
                muted
                loop
              />
            </div>
          )}
          <button
            type="button"
            className="flex gap-4 rounded-xl border px-4 py-2"
            onClick={() => {
              setFile(undefined);
              setFileUrl(undefined);
            }}
          >
            Remove
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      )}
    </main>
  );
}
