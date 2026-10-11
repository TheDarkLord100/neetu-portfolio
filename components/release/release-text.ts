import type { Release } from "@/lib/data/types";
import { format } from "@/lib/i18n/format";
import type { Messages } from "@/lib/i18n/messages";

type ReleaseMessages = Messages["release"];

/** Detail line under/beside a stamp (DESIGN.md §6.6), from release data. */
export function releaseDetail(release: Release, m: ReleaseMessages): string {
  const d = m.detail;
  const platform = release.platform.name;
  switch (release.format) {
    case "online":
      return release.chapterCount
        ? format(d.onlineChapters, { platform, count: release.chapterCount })
        : format(d.online, { platform });
    case "audiobook": {
      const fromSeries = release.inheritedFrom?.kind === "series";
      if (release.narrator) {
        return format(fromSeries ? d.seriesAudiobook : d.audiobook, { narrator: release.narrator });
      }
      return fromSeries ? d.seriesAudiobookPlain : d.audiobookPlain;
    }
    case "print":
      return release.publisher ? format(d.print, { publisher: release.publisher }) : d.printPlain;
    case "ebook":
      return format(d.ebook, { platform });
  }
}

/** Accessible name for a stamp or pill: "पढ़ें — Pratilipi". */
export function releaseAccessibleName(release: Release, m: ReleaseMessages): string {
  return format(m.accessibleName, { verb: m.verbs[release.verb], platform: release.platform.name });
}
