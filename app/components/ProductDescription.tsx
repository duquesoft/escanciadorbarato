import React from 'react'

interface ProductDescriptionProps {
  text: string
  compact?: boolean
  fallbackText?: string
}

type DescriptionBlock =
  | { type: 'paragraph'; content: string }
  | { type: 'heading'; content: string }
  | { type: 'list'; items: string[] }

function renderInlineBold(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>
    }

    return <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>
  })
}

function parseDescriptionBlocks(text: string): DescriptionBlock[] {
  const lines = text.split(/\r?\n/)
  const blocks: DescriptionBlock[] = []
  let paragraphLines: string[] = []

  const flushParagraph = () => {
    if (paragraphLines.length === 0) {
      return
    }

    blocks.push({
      type: 'paragraph',
      content: paragraphLines.join(' ').trim(),
    })
    paragraphLines = []
  }

  const appendListItem = (item: string) => {
    const last = blocks[blocks.length - 1]

    if (!last || last.type !== 'list') {
      blocks.push({ type: 'list', items: [item] })
      return
    }

    last.items.push(item)
  }

  for (const rawLine of lines) {
    const line = rawLine.trim()

    if (!line) {
      flushParagraph()
      continue
    }

    if (line.startsWith('- ')) {
      flushParagraph()
      appendListItem(line.slice(2).trim())
      continue
    }

    if (line.endsWith(':') && !line.startsWith('- ')) {
      flushParagraph()
      blocks.push({ type: 'heading', content: line.slice(0, -1).trim() })
      continue
    }

    paragraphLines.push(line)
  }

  flushParagraph()
  return blocks
}

export default function ProductDescription({
  text,
  compact = false,
  fallbackText = 'Producto sin descripción.',
}: ProductDescriptionProps) {
  const normalized = (text || '').trim()
  const blocks = parseDescriptionBlocks(normalized || fallbackText)

  const paragraphClass = compact
    ? 'text-sm text-gray-700 leading-relaxed mb-4'
    : 'text-sm sm:text-base text-gray-900 leading-relaxed mb-4'
  const headingClass = compact
    ? 'text-lg font-semibold text-gray-900 mb-2 mt-5'
    : 'text-lg sm:text-xl font-semibold text-gray-900 mb-2 mt-6'
  const listClass = compact
    ? 'list-disc ml-5 text-sm text-gray-800 leading-relaxed mb-4 space-y-1'
    : 'list-disc ml-6 text-sm sm:text-base text-gray-900 leading-relaxed mb-4 space-y-1'

  return (
    <div>
      {blocks.map((block, index) => {
        if (block.type === 'heading') {
          return (
            <h3 key={`heading-${index}`} className={headingClass}>
              {renderInlineBold(block.content)}
            </h3>
          )
        }

        if (block.type === 'list') {
          return (
            <ul key={`list-${index}`} className={listClass}>
              {block.items.map((item, itemIndex) => (
                <li key={`item-${index}-${itemIndex}`}>{renderInlineBold(item)}</li>
              ))}
            </ul>
          )
        }

        return (
          <p key={`paragraph-${index}`} className={paragraphClass}>
            {renderInlineBold(block.content)}
          </p>
        )
      })}
    </div>
  )
}