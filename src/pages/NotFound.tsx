import { useLocation, Link } from 'react-router-dom'
import { useEffect } from 'react'

const NotFound = () => {
  const location = useLocation()

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname)
  }, [location.pathname])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 animate-fade-in">
      <div className="text-center space-y-6 max-w-md mx-auto">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20 shadow-sm">
          <span className="text-4xl font-bold text-primary">404</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Página não encontrada</h1>
        <p className="text-lg text-muted-foreground">
          O caminho que você tentou acessar não existe ou foi movido.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all duration-300 shadow-md hover:scale-[1.02] active:scale-95 mt-4"
        >
          Voltar para o Início
        </Link>
      </div>
    </div>
  )
}

export default NotFound
