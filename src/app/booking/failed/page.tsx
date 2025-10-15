"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { XCircle, Home, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function BookingFailedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-background py-12">
      <div className="container-custom max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Failed Icon */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <XCircle className="w-10 h-10 text-error" />
            </motion.div>

            <h1 className="heading-2 mb-2 text-error">Payment Failed</h1>
            <p className="text-body">
              Your payment could not be processed. Please try again.
            </p>
          </div>

          {/* Info Card */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">What happened?</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Your payment was declined or cancelled</li>
                <li>• Your booking has not been confirmed</li>
                <li>• The time slot has been released for others</li>
                <li>• No charges were made to your account</li>
              </ul>
            </CardContent>
          </Card>

          {/* Common Reasons */}
          <Card className="mb-6 bg-muted/50">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">
                Common reasons for failure:
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Insufficient funds in your account</li>
                <li>• Incorrect card details or expired card</li>
                <li>• Payment timeout (took too long)</li>
                <li>• Card issuer declined the transaction</li>
                <li>• Network connection issues</li>
              </ul>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => router.push("/")}
              size="lg"
              className="w-full rounded-full"
            >
              <RefreshCcw className="mr-2 h-5 w-5" />
              Try Booking Again
            </Button>

            <Button
              onClick={() => router.push("/")}
              variant="outline"
              size="lg"
              className="w-full rounded-full"
            >
              <Home className="mr-2 h-5 w-5" />
              Back to Home
            </Button>
          </div>

          {/* Help Section */}
          <Card className="mt-6 bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Need Help?</h3>
              <p className="text-sm text-muted-foreground mb-3">
                If you continue to experience issues, please contact us:
              </p>
              <div className="space-y-1 text-sm">
                <p>📱 WhatsApp: +62 812 3456 7890</p>
                <p>📧 Email: info@padelbap.com</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
