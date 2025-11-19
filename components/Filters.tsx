import { Button } from "@/components/ui/button";

export default function Filters({ filter, setFilter, activeCount, completedCount }: any) {
  return (
    <div className="flex gap-2 mb-6 animate-fadeInSlow">
      <Button
        variant={filter === "all" ? "default" : "outline"}
        className="flex-1"
        onClick={() => setFilter("all")}
      >
        Tasks ({activeCount})
      </Button>

      <Button
        variant={filter === "active" ? "default" : "outline"}
        className="flex-1"
        onClick={() => setFilter("active")}
      >
        Active ({activeCount})
      </Button>

      <Button
        variant={filter === "completed" ? "default" : "outline"}
        className="flex-1"
        onClick={() => setFilter("completed")}
      >
        Completed ({completedCount})
      </Button>
    </div>
  );
}
