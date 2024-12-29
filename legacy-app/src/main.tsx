// In your main entry file (e.g., index.tsx)
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ReactDOM from "react-dom/client";
import App from "./App";

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
); // Create the root
root.render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
