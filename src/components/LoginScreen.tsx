import { useState } from 'react';
import { supabase } from '../lib/supabase';

function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const signIn = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        setErrorMessage('Přihlášení se nepovedlo. Zkontroluj e-mail a heslo.');
      }
    } catch {
      setErrorMessage('Nepodařilo se spojit se serverem. Zkontroluj připojení k internetu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      className="login-screen"
      onSubmit={(event) => {
        event.preventDefault();
        void signIn();
      }}
    >
      <h1>Matěj – rozvoz</h1>
      <p>Přihlas se účtem, který jsi dostal od kanceláře.</p>
      <input
        className="text-input"
        type="email"
        autoComplete="username"
        placeholder="E-mail"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />
      <input
        className="text-input"
        type="password"
        autoComplete="current-password"
        placeholder="Heslo"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
      />
      {errorMessage && <p className="login-error">{errorMessage}</p>}
      <button className="primary-button" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Přihlašuji…' : 'Přihlásit'}
      </button>
    </form>
  );
}

export default LoginScreen;