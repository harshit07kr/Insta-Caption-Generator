"use client";

import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea"; // Ensure you have this component or use standard <textarea>
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Loader2, Image as ImageIcon, Upload } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Props {
  onGenerated: (data: any) => void;
}

export default function CaptionForm({ onGenerated }: Props) {
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("English");
  const [length, setLength] = useState("Medium");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      // Filter only images
      const validFiles = newFiles.filter(f => f.type.startsWith("image/"));

      if (validFiles.length !== newFiles.length) {
         setError("Some files were skipped because they are not images.");
      } else {
         setError(null);
      }

      setFiles(prev => [...prev, ...validFiles]);

      // Generate previews
      const newPreviews = validFiles.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  }

  function removeFile(index: number) {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (files.length === 0) return setError("Please upload at least one image");

    setIsLoading(true);
    try {
      const formData = new FormData();
      // Append all files
      files.forEach(file => formData.append("files", file));
      formData.append("topic", topic || "General");
      formData.append("language", language);
      formData.append("length", length);
      formData.append("description", description);

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
      {/* Multi-Image Upload Area */}
      <div className="grid gap-2">
        <Label>Upload Photos</Label>
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors min-h-[150px]"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple // Enabled multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex flex-col items-center space-y-2">
             <div className="bg-primary/10 p-3 rounded-full">
                <Upload className="h-6 w-6 text-primary" />
             </div>
             <p className="text-sm text-muted-foreground">Click to upload images</p>
          </div>
        </div>

        {/* Previews Grid */}
        {previews.length > 0 && (
          <div className="flex gap-2 overflow-x-auto py-2">
            {previews.map((src, idx) => (
              <div key={idx} className="relative min-w-[100px] h-[100px]">
                <img src={src} alt="preview" className="w-full h-full object-cover rounded-md border" />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full"
                  onClick={() => removeFile(idx)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Options Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Language</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="English">English</SelectItem>
              <SelectItem value="Spanish">Spanish</SelectItem>
              <SelectItem value="Hindi">Hindi</SelectItem>
              <SelectItem value="French">French</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>Caption Length</Label>
          <Select value={length} onValueChange={setLength}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Short">Short (One-liner)</SelectItem>
              <SelectItem value="Medium">Medium (Standard)</SelectItem>
              <SelectItem value="Long">Long (Storytelling)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Context Inputs */}
      <div className="grid gap-4">
         <div className="grid gap-2">
             <Label>Vibe / Topic</Label>
             <Input 
                 placeholder="e.g., Sunset, Gym, Office Party" 
                 value={topic} 
                 onChange={(e) => setTopic(e.target.value)} 
             />
         </div>
         <div className="grid gap-2">
             <Label>Post Description (Optional)</Label>
             <Textarea 
                 placeholder="Add specific details you want in the caption..." 
                 value={description}
                 onChange={(e) => setDescription(e.target.value)}
                 className="h-20"
             />
         </div>
      </div>

      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

      <Button type="submit" disabled={isLoading} size="lg" className="w-full">
        {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Magic...</> : "Generate Caption"}
      </Button>
    </form>
  );
}