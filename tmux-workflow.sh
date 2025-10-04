#!/bin/sh

SESSION="VIMNOTION-SESSION"
SESSIONEXISTS=$(tmux list-sessions | grep $SESSION)

if [ "$SESSIONEXISTS" = "" ]
then
    # Start New Session with our name
    tmux new-session -d -s $SESSION

    # Name first Pane and start zsh
    tmux rename-window -t 0 'nvim'
    tmux send-keys -t 'nvim' 'nvim' C-m

    tmux new-window -t $SESSION:1 -n 'next-server'
    tmux send-keys -t 'next-server' 'cd nextjs-newsbaux' C-m 'npm run dev' C-m

    tmux new-window -t $SESSION:2 -n 'opencode'
    tmux send-keys -t 'opencode' 'opencode' C-m
fi

tmux attach-session -t $SESSION:0
