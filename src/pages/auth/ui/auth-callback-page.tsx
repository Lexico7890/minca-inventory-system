
import { supabase } from '@/shared/api'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function AuthCallback() {
    const navigate = useNavigate()
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Obtener el código de la URL
                const params = new URLSearchParams(window.location.search)
                const code = params.get('code')

                if (!code) {
                    throw new Error('No se recibió código de autenticación')
                }

                // Intercambiar el código por una sesión
                const { data: { session }, error: sessionError } =
                    await supabase.auth.exchangeCodeForSession(code)

                if (sessionError) throw sessionError
                if (!session) throw new Error('No se pudo crear la sesión')

                // Obtener datos del usuario de la tabla usuarios
                const { data: usuario, error: userError } = await supabase
                    .from('usuarios')
                    .select('aprobado, activo, nombre, email')
                    .eq('id_usuario', session.user.id)
                    .single()

                if (userError) {
                    console.error('Error al obtener usuario:', userError)
                    throw new Error('Error al verificar el estado del usuario')
                }

                // Validar si está aprobado
                if (!usuario.aprobado) {
                    navigate('/pending-approval', { replace: true })
                    return
                }

                // Validar si está activo
                if (!usuario.activo) {
                    await supabase.auth.signOut()
                    setError('Tu cuenta ha sido desactivada. Contacta al administrador.')
                    return
                }

                // Todo OK, redirigir al dashboard
                navigate('/dashboard', { replace: true })

            } catch (err: any) {
                console.error('Error en callback:', err)
                setError(err.message || 'Error al procesar la autenticación')

                // Esperar 3 segundos y redirigir al login
                setTimeout(() => {
                    navigate('/login', { replace: true })
                }, 3000)
            }
        }

        handleCallback()
    }, [navigate])

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full p-8 bg-white rounded-lg shadow">
                    <div className="text-center">
                        <div className="mx-auto h-12 w-12 text-red-500">
                            <svg
                                className="h-12 w-12"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <h2 className="mt-4 text-xl font-bold text-gray-900">
                            Error de Autenticación
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">{error}</p>
                        <p className="mt-4 text-xs text-gray-500">
                            Redirigiendo al login...
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full p-8 bg-white rounded-lg shadow">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 text-blue-500 animate-spin">
                        <svg
                            className="h-12 w-12"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>
                    </div>
                    <h2 className="mt-4 text-xl font-bold text-gray-900">
                        Procesando autenticación...
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Por favor espera un momento
                    </p>
                </div>
            </div>
        </div>
    )
}