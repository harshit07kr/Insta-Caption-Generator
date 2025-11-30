"use client";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { Badge } from "./ui/badge";

interface Props {
  data: {
    caption: string;
    hashtags: string[];
    translation?: string;
  };
  onReset: () => void;
}

export default function CaptionResult({ data, onReset }: Props) {
  const [copied, setCopied] = useState(false);

  // Combine caption and hashtags for easy copying
  const fullText = `${data.caption}\n\n${data.hashtags.join(" ")}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Generated Caption</CardTitle>
          <Button variant="outline" size="sm" onClick={copyToClipboard}>
            {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
            {copied ? "Copied" : "Copy All"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-md whitespace-pre-wrap text-lg">
            {data.caption}
          </div>
          
          {data.translation && (
            <div className="text-sm text-muted-foreground italic border-l-2 pl-4">
              Translation: {data.translation}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {data.hashtags.map((tag, i) => (
              <Badge key={i} variant="secondary" className="text-primary">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button variant="ghost" onClick={onReset} className="w-full">
        Generate Another
      </Button>
    </div>
  );
}