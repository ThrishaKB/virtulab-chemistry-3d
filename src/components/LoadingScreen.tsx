export default function LoadingScreen() {
  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
      <div className="text-center space-y-4">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto" />
        <p className="text-xl text-foreground/60">Loading lab environment...</p>
      </div>
    </div>
  )
}
