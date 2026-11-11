import { PieChart } from "lucide-react";
import Link from "next/link";
import { cn } from "cn";
import { AccountMenu } from "@/features/profile/components/account-menu";
import { getProfile } from "@/features/profile/queries";
import { requireUserId } from "@/lib/auth";
import { CONTROL_PATH, PLANNING_PATH, type AppSection } from "@/lib/app-routes";
import { SECTION_NAV_LABELS } from "@/lib/control-labels";

const SECTION_LINKS: { section: AppSection; href: string }[] = [
  { section: "planning", href: PLANNING_PATH },
  { section: "control", href: CONTROL_PATH },
];

type AppHeaderProps = {
  /** Página atual, destacada na navegação (FR-002); ausente em páginas fora dela (ex.: perfil) */
  current?: AppSection;
};

/**
 * Cabeçalho da área logada: logo, menu Planejamento/Controle e, no canto direito, o avatar que
 * abre o menu da conta com "Perfil" e "Sair" (feature 005, FR-001/006).
 */
export async function AppHeader({ current }: AppHeaderProps) {
  const userId = await requireUserId();
  const profile = await getProfile(userId);

  return (
    <header className="border-b">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 tablet:px-6">
        <span className="flex items-center gap-2.5 font-bold tracking-tight">
          <span
            aria-hidden="true"
            className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground"
          >
            <PieChart className="size-4" strokeWidth={2.2} />
          </span>
          <h1 className="text-base">Finanças Pessoais</h1>
        </span>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <nav aria-label="Seções" className="flex items-center gap-5">
            {SECTION_LINKS.map(({ section, href }) => {
              const isCurrent = section === current;
              return (
                <Link
                  key={section}
                  href={href}
                  aria-current={isCurrent ? "page" : undefined}
                  className={cn(
                    "flex min-h-11 items-center border-b-2 text-sm transition-colors",
                    isCurrent
                      ? "border-primary font-semibold text-foreground"
                      : "border-transparent font-medium text-muted-foreground hover:text-foreground",
                  )}
                >
                  {SECTION_NAV_LABELS[section]}
                </Link>
              );
            })}
          </nav>
          <AccountMenu profile={profile} />
        </div>
      </div>
    </header>
  );
}
