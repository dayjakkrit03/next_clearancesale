// src/app/not-found.tsx

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <div className="text-center p-8 bg-card rounded-lg shadow-md max-w-md mx-4">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <p className="text-2xl font-semibold text-foreground mb-4">
          Oops! Page Not Found
        </p>
        <p className="text-muted-foreground mb-8">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link
          href="/"
          className="inline-block bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
        >
          Return to Homepage
        </Link>
      </div>
    </div>
  );
}


// // src/app/not-found.tsx

// "use client";

// import Link from "next/link";

// export default function NotFound() {
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-muted">
//       <div className="text-center p-8 bg-card rounded-lg shadow-md max-w-md mx-4">
//         <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
//         <p className="text-2xl font-semibold text-foreground mb-4">
//           Oops! Page Not Found
//         </p>
//         <p className="text-muted-foreground mb-8">
//           The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
//         </p>
//         <Link
//           href="/"
//           className="inline-block bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
//         >
//           Return to Homepage
//         </Link>
//       </div>
//     </div>
//   );
// }