import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated gradient background */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `linear-gradient(135deg, 
            hsl(var(--primary)) 0%, 
            hsl(var(--primary-glow)) 25%,
            hsl(var(--accent)) 50%,
            hsl(var(--primary-glow)) 75%,
            hsl(var(--primary)) 100%)`,
          backgroundSize: "400% 400%",
          animation: "gradient-shift 8s ease infinite",
        }}
      />
      
      {/* Glowing orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-primary/20 blur-3xl animate-float" />
      <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-accent/20 blur-3xl animate-float" style={{ animationDelay: "-3s" }} />
      
      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="text-center space-y-8 max-w-3xl">
          {/* Logo/Brand */}
          <div className="space-y-4">
            <h1 className="text-7xl md:text-8xl font-black tracking-tighter">
              <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent animate-gradient-shift" style={{ backgroundSize: "200% 200%" }}>
                genz
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-medium">
              Your blank canvas awaits
            </p>
          </div>

          {/* CTA Button */}
          <div className="pt-4">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 rounded-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/50 transition-all hover:shadow-xl hover:shadow-primary/60 hover:scale-105"
            >
              Get Started
            </Button>
          </div>

          {/* Tagline */}
          <p className="text-sm text-muted-foreground/80 pt-8">
            Built with ⚡️ and ready to scale
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
