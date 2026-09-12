import { useState } from 'react'
import { Button } from '@adit_firdaus/may-ui'

export function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="site-code-block">
      <Button
        className="site-code-copy"
        size="sm"
        variant="gray"
        onClick={async () => {
          await navigator.clipboard.writeText(code)
          setCopied(true)
          window.setTimeout(() => setCopied(false), 1400)
        }}
      >
        {copied ? 'Copied' : 'Copy'}
      </Button>
      <pre><code>{code}</code></pre>
    </div>
  )
}
