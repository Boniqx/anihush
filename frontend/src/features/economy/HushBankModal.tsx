"use client";

import React, { useState, useRef } from "react";
import {
  useDynamicContext,
  useSwitchNetwork,
} from "@dynamic-labs/sdk-react-core";
import { X, Coins, Sparkles } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { parseEther } from "viem";

interface HushBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
  onSuccess: (newBalance: number) => void;
}

export default function HushBankModal({
  isOpen,
  onClose,
  currentBalance,
  onSuccess,
}: HushBankModalProps) {
  const { primaryWallet, network } = useDynamicContext();
  const switchNetwork = useSwitchNetwork();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  console.log("Context Network:", network);
  // Sync network from context, or fetch if undefined
  const [currentNetwork, setCurrentNetwork] = useState<
    number | string | undefined
  >(network);

  React.useEffect(() => {
    if (network !== undefined) {
      setCurrentNetwork(network);
    } else if (primaryWallet) {
      // Fallback: Try to get network from connector
      const fetchNetwork = async () => {
        try {
          const connector = primaryWallet.connector as any;
          if (connector.getNetwork) {
            const net = await connector.getNetwork();
            console.log("Fetched network manually:", net);
            setCurrentNetwork(net);
          }
        } catch (e) {
          console.error("Failed to fetch network manually:", e);
        }
      };
      fetchNetwork();
    }
  }, [network, primaryWallet]);

  const isSepolia = currentNetwork === 11155111;

  useGSAP(() => {
    if (isOpen) {
      gsap.to(overlayRef.current, {
        opacity: 1,
        duration: 0.3,
        display: "flex",
      });
      gsap.fromTo(
        modalRef.current,
        { scale: 0.8, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: "back.out(1.7)" },
      );
    } else {
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.2,
        display: "none",
        onComplete: () => {
          // ensuring display none is set
        },
      });
    }
  }, [isOpen]);

  const handleAction = async () => {
    if (!primaryWallet) {
      setError("Please connect your wallet first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (!isSepolia) {
        console.log("Switching to Sepolia network...");
        await switchNetwork({ wallet: primaryWallet, network: 11155111 });
        // We return here. The user will click the button again (which will now say "Purchase")
        // once the network switch is detected by the UI re-render.
        setLoading(false);
        return;
      }

      // If on Sepolia, proceed with purchase
      const walletClient = await (
        primaryWallet.connector as any
      ).getWalletClient();
      const amountEth = "0.01";
      const amountWei = parseEther(amountEth);

      // TODO: Replace with your actual testnet wallet address
      const toAddress = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";

      const hash = await walletClient.sendTransaction({
        to: toAddress,
        value: amountWei,
      });

      console.log("Transaction sent:", hash);

      // Call Backend to record deposit
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/economy/deposit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tx_hash: hash,
            amount: 0.01,
          }),
        },
      );

      const text = await res.text();
      console.log("Raw Response:", text);
      const data = JSON.parse(text);
      if (!res.ok) throw new Error(data.error || "Failed to process deposit");

      // Animate Coins
      triggerCoinShower();

      onSuccess(data.new_balance);
      setTimeout(() => {
        onClose();
        setLoading(false);
      }, 2000);
    } catch (err: any) {
      console.error(err);
      if (err.message && err.message.includes("User rejected")) {
        setError("Transaction rejected.");
      } else {
        setError(err.message || "Transaction failed");
      }
      setLoading(false);
    }
  };

  const triggerCoinShower = () => {
    // Simple GSAP animation for coins falling
    // For now, just logging or a simple effect could be added here
    console.log("Coin Shower!");
  };

  if (!isOpen && !gsap.isTweening(overlayRef.current)) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm hidden items-center justify-center p-4"
    >
      <div
        ref={modalRef}
        className="bg-[#1a1a23] border border-[#ff7e27]/30 p-6 rounded-2xl w-full max-w-md relative shadow-2xl shadow-orange-900/20"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-[#ff7e27]/10 rounded-full flex items-center justify-center mb-4 border border-[#ff7e27]/20">
            <Coins className="w-8 h-8 text-[#ff7e27]" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-1">Hush Bank</h2>
          <p className="text-sm text-gray-400 mb-6">
            Top up your account to unlock premium story choices.
          </p>

          <div className="w-full bg-[#121214] rounded-xl p-4 mb-6 border border-[#27272a]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">Current Balance</span>
              <span className="font-mono text-[#ff7e27] font-bold">
                {currentBalance} Coins
              </span>
            </div>
            <div className="h-px w-full bg-[#27272a] my-3" />
            <div className="flex justify-between items-center">
              <span className="text-sm text-white">500 Coins</span>
              <span className="text-xs font-bold bg-[#27272a] px-2 py-1 rounded text-white">
                0.01 ETH
              </span>
            </div>
          </div>

          {error && <p className="text-red-500 text-xs mb-4">{error}</p>}

          <button
            onClick={handleAction}
            disabled={loading}
            className="w-full py-3 bg-[#ff7e27] text-black font-bold rounded-xl hover:bg-[#ff9a50] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <Sparkles className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 fill-black" />
            )}
            {loading ? (
              "Processing..."
            ) : isSepolia ? (
              "Purchase for 0.01 ETH"
            ) : (
              <div className="flex items-center gap-2">
                <img
                  src="/images/networks/sepolia.png"
                  alt="Sepolia"
                  className="w-5 h-5 rounded-full"
                />
                <span>Switch to Sepolia Network</span>
              </div>
            )}
          </button>

          <div className="flex items-center gap-1.5 mt-4 opacity-50">
            <img
              src="/images/networks/sepolia.png"
              alt="Sepolia"
              className="w-3 h-3 rounded-full"
            />
            <p className="text-[10px] text-gray-500">
              Powered by Ethereum Sepolia Testnet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
