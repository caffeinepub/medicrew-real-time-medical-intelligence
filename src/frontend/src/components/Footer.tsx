import { Heart } from 'lucide-react';

export default function Footer() {
  const appIdentifier = typeof window !== 'undefined' 
    ? encodeURIComponent(window.location.hostname) 
    : 'medicrew-app';

  return (
    <footer className="border-t card-soft mt-auto">
      <div className="container py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>© {new Date().getFullYear()}. Built with</span>
            <Heart className="w-4 h-4 text-primary fill-primary" />
            <span>using</span>
            <a 
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appIdentifier}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline transition-colors"
            >
              caffeine.ai
            </a>
          </div>
          <div className="text-xs text-muted-foreground">
            Powered by Internet Computer • Secure & Private
          </div>
        </div>
      </div>
    </footer>
  );
}
