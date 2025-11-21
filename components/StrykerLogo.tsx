// Stryker Logo Component
// Displays the lowercase "stryker" text logo in bold black

export default function StrykerLogo({ className = '' }: { className?: string }) {
  return (
    <div className={`font-bold text-black ${className}`} style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', letterSpacing: '-0.02em' }}>
      stryker
    </div>
  )
}

