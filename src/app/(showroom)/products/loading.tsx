import { LoadingState } from "@/components/common/LoadingState";

export default function ProductsLoading() {
  return (
    <main id="main" className="mx-auto flex w-full max-w-6xl flex-1 px-4 py-16 sm:px-6 lg:px-8">
      <LoadingState label="Loading the collection" />
    </main>
  );
}
