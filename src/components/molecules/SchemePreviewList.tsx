// src/components/molecules/SchemePreviewList.tsx
import { View } from "react-native";
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

const defaultSchemes: Scheme[] = [
  {
    id: "1",
    title: "Pradhan Mantri Jan Dhan Yojana",
    description:
      "Financial inclusion program providing banking services to unbanked citizens",
    category: "Financial Inclusion",
    imageUrl: "https://via.placeholder.com/64x64/386641/FFFFFF?text=PMJDY",
  },
  {
    id: "2",
    title: "Ayushman Bharat Yojana",
    description:
      "Health insurance scheme providing coverage up to ₹5 lakhs per family",
    category: "Healthcare",
    imageUrl: "https://via.placeholder.com/64x64/4CAF50/FFFFFF?text=ABY",
  },
  {
    id: "3",
    title: "Pradhan Mantri Awas Yojana",
    description: "Housing scheme for affordable homes for all by 2022",
    category: "Housing",
    imageUrl: "https://via.placeholder.com/64x64/FF9800/FFFFFF?text=PMAY",
  },
  {
    id: "4",
    title: "Swachh Bharat Mission",
    description: "Clean India campaign for sanitation and waste management",
    category: "Sanitation",
    imageUrl: "https://via.placeholder.com/64x64/9C27B0/FFFFFF?text=SBM",
  },
];

export default function SchemePreviewList({
  schemes = defaultSchemes,
}: SchemePreviewListProps) {
  return (
    <View className="mt-4">
      {schemes.map((scheme) => (
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
