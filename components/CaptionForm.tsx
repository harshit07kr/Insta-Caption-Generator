"use client";

import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "@radix-ui/react-label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Loader2, Image as ImageIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Props {
  onGenerated: (data: any) => void;
}

export default function CaptionForm({ onGenerated }: Props) {
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState("English");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith("image/")) {
        setError("Please upload a valid image file");
        return;
      }
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError(null);
    }
  }

  function removeFile() {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return setError("Please upload an image");

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("topic", topic || "General");
      formData.append("language", language);

      const res = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to generate caption");

      const data = await res.json();
      onGenerated(data);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6">
      {/* Image Upload Area */}
      <div className="grid gap-2">
        <Label>Upload Photo</Label>
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors min-h-[200px]"
        >
          {preview ? (
            <div className="relative w-full h-full flex justify-center">
              <img src={preview} alt="Preview" className="max-h-[200px] rounded-md object-contain" />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6"
                onClick={(e) => { e.stopPropagation(); removeFile(); }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-2">
              <div className="bg-primary/10 p-3 rounded-full inline-flex">
                <ImageIcon className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">Click to upload image</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Language</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="English">English</SelectItem>
              <SelectItem value="Spanish">Spanish</SelectItem>
              <SelectItem value="French">French</SelectItem>
              <SelectItem value="German">German</SelectItem>
              <SelectItem value="Japanese">Japanese</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>Topic / Vibe (Optional)</Label>
          <Input 
            placeholder="e.g., Travel, Food, Motivational" 
            value={topic} 
            onChange={(e) => setTopic(e.target.value)} 
          />
        </div>
      </div>

      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

      <Button type="submit" disabled={isLoading} size="lg" className="w-full">
        {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing Image...</> : "Generate Caption"}
      </Button>
    </form>
  );
}