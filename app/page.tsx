"use client";

import { useState } from "react";
import CaptionForm from "../components/CaptionForm"; 
import CaptionResult from "../components/CaptionResult"
import { Camera } from "lucide-react";

export default function Home() {
  const [result, setResult] = useState<any>(null);

  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
            <Camera className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">InstaGen Agent</h1>
          <p className="text-muted-foreground">
            Upload a photo. Get the perfect caption in any language.
          </p>
        </div>

        {/* Content */}
        <div className="bg-card border rounded-xl p-6 shadow-sm">
          {!result ? (
            <CaptionForm onGenerated={setResult} />
          ) : (
            <CaptionResult data={result} onReset={() => setResult(null)} />
          )}
        </div>
      </div>
    </main>
  );
}