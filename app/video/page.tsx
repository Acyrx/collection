import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FileTranscriptionTab from "@/components/transcriptify/FileTranscriptionTab";
import YoutubeTranscriptionTab from "@/components/transcriptify/YoutubeTranscriptionTab";
import { FileText } from "lucide-react"; // Icon for the app logo

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-start p-4 md:p-8 bg-background font-body">
      <div className="w-full max-w-3xl space-y-8">
        <header className="text-center py-6">
          <div className="flex items-center justify-center mb-4">
            <FileText className="h-12 w-12 text-primary" /> {/* Simple logo */}
            <h1 className="text-5xl font-headline font-extrabold text-primary ml-3">
              Transcriptify
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            AI-powered audio and video transcription made simple.
          </p>
        </header>

        <Tabs defaultValue="file" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-primary/10 p-1 rounded-lg">
            <TabsTrigger 
              value="file" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:bg-primary/20 transition-all duration-200"
            >
              File Transcription
            </TabsTrigger>
            <TabsTrigger 
              value="youtube"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:bg-primary/20 transition-all duration-200"
            >
              YouTube Transcription
            </TabsTrigger>
          </TabsList>
          <TabsContent value="file" className="mt-6">
            <FileTranscriptionTab />
          </TabsContent>
          <TabsContent value="youtube" className="mt-6">
            <YoutubeTranscriptionTab />
          </TabsContent>
        </Tabs>

        <footer className="text-center text-sm text-muted-foreground py-8">
          <p>&copy; {new Date().getFullYear()} Transcriptify. All rights reserved.</p>
          <p className="mt-1">Powered by GenAI</p>
        </footer>
      </div>
    </div>
  );
}
