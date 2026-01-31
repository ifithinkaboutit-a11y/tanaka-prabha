// src/components/molecules/SchemePreviewList.tsx
import { View } from "react-native";
import { useTranslation } from "../../i18n";
import SchemePreviewCard from "../atoms/SchemePreviewCard";

type Scheme = {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  onPress?: () => void;
};

type SchemePreviewListProps = {
  schemes?: Scheme[];
};

export default function SchemePreviewList({
  schemes,
}: SchemePreviewListProps) {
  const { t } = useTranslation();

  const defaultSchemes: Scheme[] = [
    {
      id: "1",
      title: t("schemes.pmjdy.title"),
      description: t("schemes.pmjdy.description"),
      category: t("schemes.pmjdy.category"),
      imageUrl: "https://via.placeholder.com/64x64/386641/FFFFFF?text=PMJDY",
    },
    {
      id: "2",
      title: t("schemes.aby.title"),
      description: t("schemes.aby.description"),
      category: t("schemes.aby.category"),
      imageUrl: "https://via.placeholder.com/64x64/4CAF50/FFFFFF?text=ABY",
    },
    {
      id: "3",
      title: t("schemes.pmay.title"),
      description: t("schemes.pmay.description"),
      category: t("schemes.pmay.category"),
      imageUrl: "https://via.placeholder.com/64x64/FF9800/FFFFFF?text=PMAY",
    },
    {
      id: "4",
      title: t("schemes.sbm.title"),
      description: t("schemes.sbm.description"),
      category: t("schemes.sbm.category"),
      imageUrl: "https://via.placeholder.com/64x64/9C27B0/FFFFFF?text=SBM",
    },
  ];

  const displaySchemes = schemes || defaultSchemes;

  return (
    <View className="mt-4">
      {displaySchemes.map((scheme) => (
        <SchemePreviewCard
          key={scheme.id}
          title={scheme.title}
          description={scheme.description}
          category={scheme.category}
          imageUrl={scheme.imageUrl}
          onPress={
            scheme.onPress ||
            (() => console.log(`Navigate to scheme: ${scheme.id}`))
          }
        />
      ))}
    </View>
  );
}
