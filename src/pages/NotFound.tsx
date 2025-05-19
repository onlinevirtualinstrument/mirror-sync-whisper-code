import { useLocation, Link, useNavigate } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import { Guitar, Home, ChevronLeft, Piano, Music, Drum, ArrowBigLeftIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/components/layout/AppLayout';

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <AppLayout>
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

     <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4">
        <div className="max-w-md w-full space-y-8 text-center">
          <Guitar className="mx-auto h-24 w-24 text-gray-400 animate-[string-vibration_4s_ease-in-out_infinite]" />

          <h1 className="text-3xl font-extrabold tracking-tight">
            404 - Page Not Found
          </h1>

          <p className="mt-2 text-lg text-muted-foreground">
            Sorry, we couldn't find the page you're looking for.
          </p>
          <div className="mt-8 flex flex-row flex-nowrap items-center justify-center gap-4">
            <Button variant="destructive" className="hover:bg-gray-200" onClick={() => navigate(-1)}>
              < ArrowBigLeftIcon className="mr-1 h-4 w-4" />
              Go Back
            </Button>
            <Button asChild variant="default" size="lg" className="gap-1">
              <Link to="/">
                <Home className="mr-1 h-4 w-4" />
                Go Home
              </Link>
            </Button>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild variant="outline" size="lg" className="gap-1">
              <Link to="/piano">
                <Piano className="mr-1 h-4 w-4" />
                Try Virtual Piano
              </Link>
            </Button>

            <Button asChild variant="outline" size="lg" className="gap-1">
              <Link to="/guitar">
                <Guitar className="mr-1 h-4 w-4" />
                Try Virtual Guitar
              </Link>
            </Button>

            <Button asChild variant="outline" size="lg" className="gap-1">
              <Link to="/violin">
                <Music className="mr-1 h-4 w-4" />
                Try Virtual Violin
              </Link>
            </Button>

          

          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">



            <Button asChild variant="outline" size="lg" className="gap-1">
              <Link to="/harmonica">
                <Music className="mr-1 h-4 w-4" />
                Try Virtual Harmonica
              </Link>
            </Button>

            <Button asChild variant="outline" size="lg" className="gap-1">
              <Link to="/veena">
                <Music className="mr-1 h-4 w-4" />
                Try Virtual Veena
              </Link>
            </Button>

            <Button asChild variant="outline" size="lg" className="gap-1">
              <Link to="/drummachine">
                <Music className="mr-1 h-4 w-4" />
                Try Drum Machine
              </Link>
            </Button>

            <Button asChild variant="outline" size="lg" className="gap-1">
              <Link to="/chordprogression">
                <Drum className="mr-1 h-4 w-4" />
                Try Chord Progression Player
              </Link>
            </Button>

            <Button asChild variant="outline" size="lg" className="gap-1">
              <Link to="/flute">
                <Music className="mr-1 h-4 w-4" />
                Try Virtual Flute
              </Link>
            </Button>

          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">

          <Button asChild variant="outline" size="lg" className="gap-1">
              <Link to="/xylophone">
                <Music className="mr-1 h-4 w-4" />
                Try Virtual Xylophone
              </Link>
            </Button>

            <Button asChild variant="outline" size="lg" className="gap-1">
              <Link to="/saxophone">
                <Music className="mr-1 h-4 w-4" />
                Try Virtual Saxophone
              </Link>
            </Button>

            <Button asChild variant="outline" size="lg" className="gap-1">
              <Link to="/trumpet">
                <Music className="mr-1 h-4 w-4" />
                Try Virtual Trumpet
              </Link>
            </Button>


            <Button asChild variant="outline" size="lg" className="gap-1">
              <Link to="/kalimba">
                <Music className="mr-1 h-4 w-4" />
                Try Virtual Kalimba
              </Link>
            </Button>
          

          <Button asChild variant="outline" size="lg" className="gap-1">
            <Link to="/marimba">
              <Music className="mr-1 h-4 w-4" />
              Try Virtual Marimba
            </Link>
          </Button>
        </div>


      </div>
      </div>

    </div>

    </AppLayout>
  );
};

export default NotFound;
