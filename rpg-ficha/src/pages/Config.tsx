import { Download, LogOut, RotateCcw, Upload } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { normalizeState, useCharacter } from '../context/CharacterContext'
import { btnCls, Card } from '../components/ui'

export default function Config() {
  const { state, setDark, replaceAll, reset } = useCharacter()

  // Exporta o estado inteiro como arquivo JSON
  const exportar = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url; a.download = `ficha-${state.character.name || 'rpg'}.json`; a.click()
    URL.revokeObjectURL(url)
  }
  // Lê um JSON exportado antes e substitui os dados atuais
  const importar = (f?: File) => {
    if (!f) return
    const r = new FileReader()
    r.onload = () => {
      try { replaceAll({ ...normalizeState(JSON.parse(String(r.result))), dark: state.dark }) }
      catch (e) { alert(e instanceof SyntaxError ? 'O arquivo não é um JSON válido.' : (e as Error).message) }
    }
    r.readAsText(f)
  }
  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold text-amber-400">⚙️ Configurações</h2>
      <Card className="space-y-4">
        <label className="flex items-center gap-3">
          <input type="checkbox" checked={state.dark} onChange={e => setDark(e.target.checked)} /> Tema escuro
        </label>
        <button className={btnCls} onClick={exportar}><Download size={16} /> Exportar ficha (JSON)</button>
        <label className={`${btnCls} cursor-pointer`}>
          <Upload size={16} /> Importar ficha
          <input type="file" accept="application/json" className="hidden" onChange={e => { importar(e.target.files?.[0]); e.target.value = '' }} />
        </label>
        <button className="inline-flex items-center gap-2 rounded-lg bg-red-800 px-4 py-2 hover:bg-red-700"
          onClick={() => confirm('Apagar todos os dados e voltar à ficha inicial?') && reset()}>
          <RotateCcw size={16} /> Resetar dados
        </button>
        <button className={btnCls} onClick={() => supabase.auth.signOut()}><LogOut size={16} /> Sair da conta</button>
      </Card>
    </div>
  )
}
