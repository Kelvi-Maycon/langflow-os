import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { Block } from '@/hooks/use-practice-engine'

interface Props {
  shuffledBlocks: Block[]
  selectedIndices: number[]
  setSelectedIndices: (val: number[] | ((prev: number[]) => number[])) => void
  status: string
  feedback: boolean[]
}

export function PracticeBuilder({
  shuffledBlocks,
  selectedIndices,
  setSelectedIndices,
  status,
  feedback,
}: Props) {
  const [draggedId, setDraggedId] = useState<number | null>(null)
  const [dragTarget, setDragTarget] = useState<number | null>(null)

  const handleBlockClick = (id: number) => {
    if (status !== 'idle' && status !== 'checking') return
    if (selectedIndices.includes(id)) setSelectedIndices((prev) => prev.filter((x) => x !== id))
    else setSelectedIndices((prev) => [...prev, id])
  }

  const onDragStart = (e: React.DragEvent, id: number) => {
    if (status === 'correct' || status === 'incorrect') {
      e.preventDefault()
      return
    }
    setDraggedId(id)
    e.dataTransfer.setData('text/plain', id.toString())
  }

  const onDropBlock = (e: React.DragEvent, targetId: number) => {
    e.preventDefault()
    e.stopPropagation()
    setDragTarget(null)
    if (draggedId === null || draggedId === targetId) return
    const isDragSel = selectedIndices.includes(draggedId)
    const isTargetSel = selectedIndices.includes(targetId)
    const newInd = [...selectedIndices]

    if (isDragSel && isTargetSel) {
      newInd.splice(newInd.indexOf(draggedId), 1)
      newInd.splice(newInd.indexOf(targetId), 0, draggedId)
    } else if (!isDragSel && isTargetSel) {
      newInd.splice(newInd.indexOf(targetId), 0, draggedId)
    }
    setSelectedIndices(newInd)
    setDraggedId(null)
  }

  const getBlockClass = (id: number, inZone: boolean, i?: number) => {
    let base =
      'px-5 py-3 rounded-xl font-bold text-lg border-2 transition-all cursor-pointer select-none active:scale-95'
    if (inZone) {
      if (status === 'checking')
        base = cn(
          base,
          feedback[i!]
            ? 'bg-success text-success-foreground border-success'
            : 'bg-destructive text-destructive-foreground border-destructive',
        )
      else if (status === 'correct')
        base = cn(base, 'bg-success text-success-foreground border-success')
      else if (status === 'incorrect')
        base = cn(base, 'bg-destructive/10 text-destructive border-destructive/30')
      else base = cn(base, 'bg-background border-border text-foreground hover:bg-secondary')
      if (dragTarget === id) base = cn(base, 'ring-2 ring-primary ring-offset-2 border-primary')
    } else {
      if (selectedIndices.includes(id))
        base = cn(
          base,
          'bg-secondary/50 text-transparent border-transparent shadow-none scale-95 pointer-events-none',
        )
      else
        base = cn(
          base,
          'bg-card border-border hover:bg-secondary text-foreground hover:-translate-y-1 shadow-sm',
        )
    }
    return cn(base, draggedId === id && 'opacity-50')
  }

  return (
    <div className="flex-1 flex flex-col justify-end space-y-6">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          setDragTarget(null)
          if (draggedId !== null && !selectedIndices.includes(draggedId))
            setSelectedIndices([...selectedIndices, draggedId])
          setDraggedId(null)
        }}
        className={cn(
          'min-h-[100px] p-6 rounded-3xl border-2 flex flex-wrap gap-3 items-center transition-colors',
          selectedIndices.length === 0
            ? 'border-dashed border-border/80 bg-secondary/20'
            : 'border-solid border-primary/30 bg-primary/5',
        )}
      >
        {selectedIndices.length === 0 && (
          <span className="text-muted-foreground/60 italic px-2 font-medium w-full text-center">
            Arraste ou clique nos blocos abaixo para inseri-los aqui...
          </span>
        )}
        {selectedIndices.map((id, i) => (
          <button
            key={id}
            draggable
            onDragStart={(e) => onDragStart(e, id)}
            onDragOver={(e) => {
              e.preventDefault()
              if (draggedId !== id) setDragTarget(id)
            }}
            onDragLeave={() => setDragTarget(null)}
            onDrop={(e) => onDropBlock(e, id)}
            onClick={() => handleBlockClick(id)}
            className={getBlockClass(id, true, i)}
          >
            {shuffledBlocks.find((b) => b.id === id)?.text}
          </button>
        ))}
      </div>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          setDragTarget(null)
          if (draggedId !== null && selectedIndices.includes(draggedId))
            setSelectedIndices((prev) => prev.filter((id) => id !== draggedId))
          setDraggedId(null)
        }}
        className="flex flex-wrap justify-center gap-3 py-6 min-h-[100px]"
      >
        {shuffledBlocks.map((block) => (
          <button
            key={block.id}
            draggable={!selectedIndices.includes(block.id)}
            onDragStart={(e) => onDragStart(e, block.id)}
            onClick={() => handleBlockClick(block.id)}
            disabled={
              selectedIndices.includes(block.id) || status === 'correct' || status === 'incorrect'
            }
            className={getBlockClass(block.id, false)}
          >
            {block.text}
          </button>
        ))}
      </div>
    </div>
  )
}
