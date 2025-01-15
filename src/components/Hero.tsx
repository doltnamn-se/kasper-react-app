import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center fade-in">
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
        Welcome to Your{" "}
        <span className="text-primary">
          New App
        </span>
      </h1>
      <p className="text-lg md:text-xl text-muted-foreground max-w-[600px] mb-8">
        Start building something amazing with modern tools and best practices.
        Your journey begins here.
      </p>
      <div className="flex gap-4">
        <Button size="lg" className="group">
          Get Started
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
        <Button size="lg" variant="outline">
          Learn More
        </Button>
      </div>
    </div>
  );
};

export default Hero;