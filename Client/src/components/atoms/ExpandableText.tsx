import React, { useState } from 'react';
import AppText from './AppText';

interface ExpandableTextProps {
    text: string;
    wordLimit?: number;
    style?: any;
}

export default function ExpandableText({ text, wordLimit = 100, style }: ExpandableTextProps) {
    const [expanded, setExpanded] = useState(false);

    if (!text) return null;

    const words = text.split(/\s+/);
    const isTooLong = words.length > wordLimit;

    const displayText = isTooLong && !expanded
        ? words.slice(0, wordLimit).join(' ') + '...'
        : text;

    return (
        <AppText variant="bodyMd" style={style}>
            {displayText}{" "}
            {isTooLong && (
                <AppText
                    variant="bodyMd"
                    style={{ color: "#2563EB", fontWeight: "600" }}
                    onPress={() => setExpanded(!expanded)}
                >
                    {expanded ? "Show less" : "Read more"}
                </AppText>
            )}
        </AppText>
    );
}
