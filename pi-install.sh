echo "---------------------------------------------------"
echo "[STARTING]  CONCATCNC INSTALL SCRIPT:     "
echo "            Please wait for each step to complete. "
echo "---------------------------------------------------"
echo "(1/10) Updating Repositories..."
sudo apt-get update
echo "(2/10) Upgrading RaspiOS..."
sudo apt-get upgrade -y
echo "(3/10) Installing local and remote desktop (LightDM, TightVNC and XRDP)..."
sudo apt install -y tightvncserver xrdp lightdm
echo "(4/10) Installing GIT..."
sudo apt-get install -y git
echo "(5/10) Installing NVM and NodeJS..."
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
. ~/.nvm/nvm.sh
nvm install lts/iron
nvm alias default lts/iron
echo "(6/10) Updating npm..."
nvm install-latest-npm
echo "(7/10) Downloading ConcatCNC source code..."
cd ~; git clone https://github.com/drb2023/ConcatCNC.git
cd ~/ConcatCNC
echo "(8/10) Installing ConcatCNC dependencies..."
npm install
echo "(9/10) Recompiling ConcatCNC dependencies..."
npm rebuild
npm install electron-rebuild
~/ConcatCNC/node_modules/.bin/electron-rebuild
echo "(10/10) Creating Menu and Desktop Shortcuts..."
cp ~/ConcatCNC/pi-shortcut.desktop ~/Desktop/ConcatCNC.desktop
sudo cp ~/ConcatCNC/pi-shortcut.desktop /usr/share/applications/ConcatCNC.desktop
echo "---------------------------------------------------"
echo "[COMPLETE] Install Complete!  Thank you!"
echo "---------------------------------------------------"
