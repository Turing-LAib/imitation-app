import { BASE_URL } from "@/constants/config";
import { GameListItem } from "@/services/getGame";
import { PlayerListItem } from "@/services/getPlayer";
import { getVoteInfo, submitVote, VoteInfo } from "@/services/vote";
import { cn } from "@/utils/cn";
import { numberToRoman } from "@/utils/format";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { Button, Dialog } from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "sonner";
type liveVoteProps = {
  gameData: GameListItem;
  playerList: PlayerListItem[];
  isVoting: boolean;
};
export default function LiveVote({
  gameData,
  playerList,
  isVoting,
}: liveVoteProps) {
  const [voteId, setVoteId] = useState<number>();
  const { primaryWallet, setShowAuthFlow } = useDynamicContext();
  const [_, setVoteInfo] = useState<VoteInfo | null>(null);
  const [conectWallet, setConectWallet] = useState<boolean>(false);
  const [voteLoading, setVoteLoading] = useState<boolean>(false);
  useEffect(() => {
    if (primaryWallet?.address) {
      getVoteInfo(primaryWallet?.address, gameData._id).then((res) => {
        setVoteInfo(res);
      });
    }
  }, [primaryWallet?.address]);
  const handleVote = async () => {
    if (!primaryWallet?.address) {
      setConectWallet(true);
      return;
    }
    setVoteLoading(true);
    try {
      const signature = await primaryWallet.signMessage(Date.now().toString());
      if (signature) {
        const res = await submitVote(
          primaryWallet?.address,
          gameData._id,
          voteId || 0
        );
        if (res.data.result) {
          toast.success("Vote Success");
          setVoteId(undefined);
        } else {
          toast.error(res.msg);
        }
      }
    } catch (e) {
      console.error("e", e);
    } finally {
      setVoteLoading(false);
    }
  };
  useEffect(() => {
    if (primaryWallet?.address) {
      setConectWallet(false);
    }
  }, [primaryWallet?.address]);
  return (
    <div className="bg-linear-to-r from-[#0C0C0C] to-[#171717] rounded-[27px] p-7 mt-7">
      <div className="bg-[#1A1A1A] rounded-2xl p-3 mb-5 flex justify-between items-center font-['Fustat']">
        <div>
          <p className="font-bold text-3xl">Live Vote</p>
          <p className="text-[#ACACAC]">
            GAME - {numberToRoman(Number(gameData._id))}
          </p>
        </div>
        <img
          src={isVoting ? "/img/voteNotLock.png" : "/img/voteLock.png"}
          className="w-6 h-7"
          alt="lock"
        />
      </div>
      <div className="space-y-2">
        {playerList.map((item) => {
          return (
            <div
              className={cn(
                "bg-[#1A1A1A] rounded-2xl p-3 flex items-center w-full",
                item.status === 1 ? "cursor-pointer" : "cursor-not-allowed",
                item.status === 1 && "bg-[#132300]",
                item._id === voteId
                  ? "border-[1px] border-[#8BE421]"
                  : "border-[1px] border-[rgba(0,0,0,0)]"
              )}
              key={item._id}
              onClick={() => {
                if (!isVoting) {
                  toast.error("It has not yet reached the voting stage.");
                  return;
                }
                if (item.status !== 1) {
                  return;
                }
                if (voteId === item._id) {
                  setVoteId(undefined);
                } else {
                  setVoteId(item._id);
                }
              }}
            >
              <img
                className="w-9 h-9 rounded-sm"
                src={item.img ? BASE_URL + item.img : "/img/ai.png"}
                alt=""
              />
              <div className="ml-2 text-[#ACACAC] text-sm">
                <p>
                  {item.name}{" "}
                  <span
                    className={cn(
                      "ml-1",
                      item.status === 1 ? "text-[#8be421]" : ""
                    )}
                  >
                    {item.status === 1 ? "ALIVE" : "DEAD"}
                  </span>
                </p>
                <p>{"[" + item.model + "]"}</p>
              </div>
              <div
                className={cn(
                  "rounded-lg px-3 py-1 ml-auto border-[1px] border-[#ACACAC]",
                  item.status === 1
                    ? voteId === item._id
                      ? "bg-[#63A11A]"
                      : "bg-black"
                    : " bg-[#504E4E]"
                )}
              >
                Select
              </div>
            </div>
          );
        })}
      </div>
      <Button
        variant="contained"
        disabled={!Boolean(voteId)}
        loading={voteLoading}
        sx={{
          mt: 2,
          width: "100%",
          py: 1.5,
          fontSize: "1.125rem",
          textTransform: "none",
          borderRadius: 2,
          border: "1px solid #ACACAC",
          backgroundColor: "#0C0C0C",
          color: "#FFFFFF",
          height: "48px",
          "&:hover": {
            backgroundColor: "#0C0C0C",
            opacity: 0.8,
          },
          "&.Mui-disabled": {
            backgroundColor: "#0C0C0C",
            color: "#FFFFFF",
            border: "1px solid #ACACAC",
            cursor: "not-allowed",
          },
          "& .MuiCircularProgress-indeterminate": {
            color: "white",
          },
        }}
        onClick={handleVote}
      >
        {!voteLoading && "VOTE"}
      </Button>
      <Dialog
        open={conectWallet}
        onClose={() => setConectWallet(false)}
        keepMounted
        aria-describedby="alert-dialog-slide-description"
        PaperProps={{
          style: {
            backgroundColor: "transparent",
            boxShadow: "none",
            maxWidth: "400px",
            width: "100%",
          },
        }}
      >
        <div className="p-8 bg-gradient-to-br from-[#1A1A1A] to-[#0C0C0C] rounded-2xl border border-[#2A2A2A] shadow-2xl">
          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-2 text-white">
              Connect Wallet
            </h2>
            <p className="text-[#ACACAC] text-center mb-6">
              Please connect your wallet to continue
            </p>
            <button
              onClick={() => setShowAuthFlow(true)}
              className="w-full py-3 px-6 bg-blue-500 cursor-pointer rounded-xl text-white font-bold transition-all duration-300 transform hover:opacity-70 shadow-lg"
            >
              Connect Wallet
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
