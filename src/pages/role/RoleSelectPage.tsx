import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelectRole } from '../../features/role/hooks';
import Button from '../../components/ui/Button';
import type { RoleSelectPayload } from '../../types/api';

const roles: { value: RoleSelectPayload['role']; label: string; description: string; icon: string }[] = [
    {
        value: 'Technician',
        label: 'Technician',
        description: 'Install & service products, earn rewards',
        icon: '🔧',
    },
    {
        value: 'Dealer',
        label: 'Dealer',
        description: 'Sell products and manage inventory',
        icon: '🏪',
    },
];

export default function RoleSelectPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const selectRole = useSelectRole();
    const [selected, setSelected] = useState<RoleSelectPayload['role'] | null>(null);

    const searchParams = new URLSearchParams(location.search);
    const redirectTo = searchParams.get('redirectTo');

    const handleContinue = async () => {
        if (!selected) return;
        try {
            await selectRole.mutateAsync({ role: selected });
            navigate(redirectTo || '/', { replace: true });
        } catch {
            // Error handled
        }
    };

    return (
        <div className="pwa-standalone-page bg-bg flex flex-col items-center justify-center px-6">
            <div className="w-full max-w-sm">
                <h1 className="text-2xl font-bold text-text-primary mb-2">Select Your Role</h1>
                <p className="text-sm text-text-muted mb-8">
                    Choose your role to get started with UNJ Rewards
                </p>

                <div className="space-y-3 mb-8">
                    {roles.map((role) => (
                        <button
                            key={role.value}
                            onClick={() => setSelected(role.value)}
                            className={`
                w-full p-4 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer
                flex items-center gap-4
                ${selected === role.value
                                    ? 'border-primary bg-primary/5 shadow-soft'
                                    : 'border-border bg-white hover:border-text-light'
                                }
              `}
                            aria-pressed={selected === role.value}
                        >
                            <span className="text-3xl">{role.icon}</span>
                            <div>
                                <div className="font-semibold text-text-primary">{role.label}</div>
                                <div className="text-xs text-text-muted mt-0.5">{role.description}</div>
                            </div>
                            {selected === role.value && (
                                <svg className="w-5 h-5 text-primary ml-auto flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                </svg>
                            )}
                        </button>
                    ))}
                </div>

                <Button
                    onClick={handleContinue}
                    fullWidth
                    size="lg"
                    loading={selectRole.isPending}
                    disabled={!selected}
                >
                    Continue
                </Button>
            </div>
        </div>
    );
}
