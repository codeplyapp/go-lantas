export interface PasswordValidationResult {
  isValid: boolean;
  score: number; // 0 - 4
  strengthLabel: 'Sangat Lemah' | 'Lemah' | 'Cukup' | 'Kuat' | 'Sangat Kuat';
  strengthColor: string;
  checks: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  };
}

export const validatePasswordPolicy = (password: string): PasswordValidationResult => {
  const minLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password);

  const passedCount = [minLength, hasUppercase, hasLowercase, hasNumber, hasSpecialChar].filter(Boolean).length;

  let strengthLabel: PasswordValidationResult['strengthLabel'] = 'Sangat Lemah';
  let strengthColor = 'bg-rose-500';

  if (passedCount === 5) {
    strengthLabel = 'Sangat Kuat';
    strengthColor = 'bg-emerald-500';
  } else if (passedCount === 4) {
    strengthLabel = 'Kuat';
    strengthColor = 'bg-teal-500';
  } else if (passedCount === 3) {
    strengthLabel = 'Cukup';
    strengthColor = 'bg-amber-500';
  } else if (passedCount === 2) {
    strengthLabel = 'Lemah';
    strengthColor = 'bg-orange-500';
  }

  // OWASP / Standard: All 5 criteria must pass for full compliance
  const isValid = minLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;

  return {
    isValid,
    score: passedCount,
    strengthLabel,
    strengthColor,
    checks: {
      minLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecialChar,
    },
  };
};
