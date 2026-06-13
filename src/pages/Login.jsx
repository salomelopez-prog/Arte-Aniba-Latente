import { Eye, EyeOff, Lock, LogIn, Mail } from 'lucide-react'
import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const Login = () => {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError('Email y contraseña son requeridos')
      return
    }
    setLoading(true)
    setError('')
    try {
      await login(form.email, form.password)
      navigate('/admin')
    } catch (err) {
      setError(err.data?.error || err.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="dark-shell relative overflow-hidden rounded-[3rem] p-7 text-clay-bg shadow-2xl shadow-night/20 md:p-8">
          <div className="absolute inset-0 grain-layer opacity-30" />
          <div className="relative">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-clay">
              <Lock className="h-8 w-8" />
            </div>
            <h1 className="mt-5 text-center font-display text-5xl font-semibold tracking-tight">
              Acceso Administrador
            </h1>
            <p className="mt-2 text-center text-clay-bg/62">
              Ingresa tus credenciales para gestionar la tienda.
            </p>

            <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
              <label className="grid gap-2 text-sm font-bold">
                Email
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-clay-bg/48" />
                  <input
                    className="w-full rounded-2xl border border-clay-bg/15 bg-clay-bg/10 px-4 py-3 pl-12 font-medium text-clay-bg placeholder:text-clay-bg/38 focus:outline-none focus:ring-2 focus:ring-clay"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="correo"
                    autoComplete="email"
                  />
                </div>
              </label>

              <label className="grid gap-2 text-sm font-bold">
                Contraseña
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-clay-bg/48" />
                  <input
                    className="w-full rounded-2xl border border-clay-bg/15 bg-clay-bg/10 px-4 py-3 pl-12 pr-12 font-medium text-clay-bg placeholder:text-clay-bg/38 focus:outline-none focus:ring-2 focus:ring-clay"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-clay-bg/48 hover:text-clay-bg"
                    onClick={() => setShowPassword((s) => !s)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </label>

              {error ? (
                <div className="rounded-2xl bg-red-500/15 px-4 py-3 text-sm font-bold text-red-300">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="focus-visible-outline inline-flex items-center justify-center gap-2 rounded-full bg-clay px-6 py-4 font-bold text-clay-bg transition hover:bg-clay-dark disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-clay-bg border-t-transparent" />
                ) : (
                  <LogIn className="h-5 w-5" />
                )}
                {loading ? 'Ingresando...' : 'Ingresar al panel'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
