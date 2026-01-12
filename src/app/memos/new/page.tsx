import { MemoEditor } from '@/components/memo'

export default function NewMemoPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-lg font-semibold text-slate-900">写日记</h1>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <MemoEditor />
        </div>
      </main>
    </div>
  )
}
