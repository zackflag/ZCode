import type { OfficialServiceKey, OfficialServiceSwitches } from "@zcode/shared";
import { Switch } from "@/components/ui/switch.js";
import { useZCodeIntl } from "@/i18n/IntlProvider.js";
import { SettingsGroupCard, SettingsRow } from "@/settings/SettingsPageParts.js";

interface OfficialServicesSettingsSectionProps {
  switches?: Partial<OfficialServiceSwitches>;
  onToggle: (key: OfficialServiceKey, enabled: boolean) => void;
}

/** 展开顺序即页面顺序；分享已永久下线，不在此列。 */
const OFFICIAL_SERVICE_FEATURES: readonly OfficialServiceKey[] = [
  "account",
  "codingPlan",
  "feedback",
  "officialMcp",
  "offPeak",
  "marketplace",
  "clientConfig",
];

export function OfficialServicesSettingsSection({
  switches,
  onToggle,
}: OfficialServicesSettingsSectionProps) {
  const { intl } = useZCodeIntl();
  return (
    <div className="space-y-4">
      <SettingsGroupCard>
        <div className="px-4 pb-2 pt-4">
          <div className="text-ui-base font-medium text-foreground">
            {intl.formatMessage({ id: "settings.officialServices.title" })}
          </div>
          <p className="mt-1 text-ui-sm text-foreground-subtle">
            {intl.formatMessage({ id: "settings.officialServices.description" })}
          </p>
        </div>
        {OFFICIAL_SERVICE_FEATURES.map((key) => {
          const label = intl.formatMessage({ id: `settings.officialServices.${key}.title` });
          return (
            <SettingsRow
              key={key}
              label={label}
              description={intl.formatMessage({ id: `settings.officialServices.${key}.desc` })}
              control={
                <Switch
                  aria-label={label}
                  checked={switches?.[key] === true}
                  onCheckedChange={(checked) => onToggle(key, checked)}
                />
              }
            />
          );
        })}
        <div className="border-t border-border px-4 py-3 text-ui-sm text-foreground-subtletest">
          {intl.formatMessage({ id: "settings.officialServices.shareNote" })}
        </div>
      </SettingsGroupCard>
    </div>
  );
}
