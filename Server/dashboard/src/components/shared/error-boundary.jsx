"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error }
    }

    componentDidCatch(error, info) {
        console.error("Dashboard ErrorBoundary caught:", error, info)
    }

    render() {
        if (this.state.hasError) {
            return (
                <Card className="m-6">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-4">
                        <div className="flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive text-3xl">
                            ⚠️
                        </div>
                        <div>
                            <h3 className="text-base font-semibold mb-1">Something went wrong</h3>
                            <p className="text-sm text-muted-foreground max-w-sm">
                                {this.state.error?.message || "An unexpected error occurred. Please try again."}
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => this.setState({ hasError: false, error: null })}
                        >
                            Try again
                        </Button>
                    </CardContent>
                </Card>
            )
        }
        return this.props.children
    }
}
