import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { SignOutButton } from "@/features/auth/components/sign-out-button";
import { CONTROL_PATH, PLANNING_PATH, type AppSection } from "@/lib/app-routes";
import { SECTION_NAV_LABELS } from "@/lib/control-labels";

const SECTION_LINKS: { section: AppSection; href: string }[] = [
  { section: "planning", href: PLANNING_PATH },
  { section: "control", href: CONTROL_PATH },
];

type AppHeaderProps = {
  /** Página atual, destacada na navegação (FR-002). */
  current: AppSection;
};

/** Cabeçalho da área logada: título, botões Planejamento/Controle e o botão de sair (FR-004). */
export function AppHeader({ current }: AppHeaderProps) {
  return (
    <header className="border-b">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
        <h1 className="text-lg font-semibold">Finanças Pessoais</h1>
        <div className="flex flex-wrap items-center gap-2">
          <nav aria-label="Seções" className="flex items-center gap-2">
            {SECTION_LINKS.map(({ section, href }) => {
              const isCurrent = section === current;
              return (
                <Link
                  key={section}
                  href={href}
                  aria-current={isCurrent ? "page" : undefined}
                  className={buttonVariants({
                    variant: isCurrent ? "default" : "outline",
                    size: "sm",
                  })}
                >
                  {SECTION_NAV_LABELS[section]}
                </Link>
              );
            })}
          </nav>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
