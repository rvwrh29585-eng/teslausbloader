#!/bin/bash

# Tesla USB Loader - Lock Sounds Manager
# Requires: brew install gum htmlq

set -e

# ============================================================================
# CONFIGURATION
# ============================================================================
CACHE_DIR="./locksounds"
BASE_URL="https://www.notateslaapp.com"
PAGE_URL="${BASE_URL}/tesla-custom-lock-sounds/"
USB_PATTERNS=("TESLADRIVE" "TESLA" "TeslaDrive" "Tesla")

# Colors - Tesla theme (red + white/gray)
RED=196
WHITE=255
GRAY=245
GREEN=46
CYAN=51

# State
SELECTED_SOUND=""
USB_VOLUME=""
PREVIEW_PID=""

# ============================================================================
# CLEANUP
# ============================================================================
cleanup() {
    # Kill any playing preview
    [[ -n "$PREVIEW_PID" ]] && kill "$PREVIEW_PID" 2>/dev/null || true
    # Remove temp files
    rm -f /tmp/tesla-download.*.sh 2>/dev/null || true
}
trap cleanup EXIT

# ============================================================================
# DEPENDENCY CHECK
# ============================================================================
check_deps() {
    if ! command -v gum &> /dev/null; then
        echo "Error: gum not installed. Run: brew install gum"
        exit 1
    fi
    if ! command -v htmlq &> /dev/null; then
        gum style --foreground "$RED" --bold "⚠ htmlq not installed"
        if gum confirm "Install htmlq via Homebrew?"; then
            brew install htmlq || { echo "Brew install failed."; exit 1; }
        else
            exit 1
        fi
    fi
}

# ============================================================================
# UI COMPONENTS
# ============================================================================
show_header() {
    clear
    echo ""
    gum style \
        --border double \
        --border-foreground "$RED" \
        --padding "1 3" \
        --margin "0 2" \
        --align center \
        --bold \
        --foreground "$WHITE" \
        "⚡ TESLA LOCK SOUND LOADER ⚡" \
        "" \
        "$(gum style --foreground $GRAY --italic 'Customize your Tesla lock chime')"
    echo ""
}

show_status() {
    local cache_count=0
    local usb_status="Not detected"
    local current_sound="None"
    
    if [[ -d "$CACHE_DIR" ]]; then
        cache_count=$(find "$CACHE_DIR" -maxdepth 1 -name "*.wav" -type f 2>/dev/null | wc -l | tr -d ' ')
    fi
    
    if [[ -n "$USB_VOLUME" && -d "$USB_VOLUME" ]]; then
        usb_status="$(gum style --foreground $GREEN "● $(basename "$USB_VOLUME")")"
        [[ -f "$USB_VOLUME/LockChime.wav" ]] && current_sound="LockChime.wav installed"
    else
        usb_status="$(gum style --foreground $GRAY "○ Not connected")"
    fi
    
    [[ -n "$SELECTED_SOUND" ]] && current_sound="$SELECTED_SOUND"
    
    gum style \
        --border rounded \
        --border-foreground "$GRAY" \
        --padding "0 2" \
        --margin "0 2" \
        "$(gum style --foreground $CYAN "Cache:")  $cache_count sounds  │  $(gum style --foreground $CYAN "USB:") $usb_status  │  $(gum style --foreground $CYAN "Selected:") $current_sound"
    echo ""
}

show_error() {
    gum style --foreground "$RED" --bold "✗ $1"
    sleep 1
}

show_success() {
    gum style --foreground "$GREEN" --bold "✓ $1"
    sleep 1
}

# ============================================================================
# USB DETECTION
# ============================================================================
detect_usb() {
    USB_VOLUME=""
    
    # Try known Tesla USB patterns first
    for pattern in "${USB_PATTERNS[@]}"; do
        if [[ -d "/Volumes/$pattern" ]]; then
            USB_VOLUME="/Volumes/$pattern"
            return 0
        fi
    done
    
    # Silent mode for initial detection (don't prompt)
    if [[ "${1:-}" == "--silent" ]]; then
        return 1
    fi
    
    # Check for any mounted external volumes
    local volumes
    volumes=$(ls /Volumes 2>/dev/null | grep -vE "^(Macintosh HD|Recovery|Preboot|VM|Data)$" | head -10)
    
    if [[ -n "$volumes" ]]; then
        local vol_count
        vol_count=$(echo "$volumes" | wc -l | xargs)
        
        if [[ "$vol_count" -eq 1 ]]; then
            # Only one external volume - use it
            USB_VOLUME="/Volumes/$volumes"
            return 0
        elif [[ "$vol_count" -gt 1 ]]; then
            # Multiple volumes - let user select
            echo ""
            gum style --foreground "$CYAN" "Multiple volumes found. Select your Tesla USB:"
            local selected
            selected=$(echo "$volumes" | gum choose --header "Available volumes:" --cursor "⚡ ")
            if [[ -n "$selected" ]]; then
                USB_VOLUME="/Volumes/$selected"
                return 0
            fi
        fi
    fi
    
    return 1
}

wait_for_usb() {
    show_header
    gum style --foreground "$CYAN" --margin "0 2" "Waiting for Tesla USB drive..."
    gum style --foreground "$GRAY" --margin "0 2" "(Plug in your USB, or press Ctrl+C to cancel)"
    echo ""
    
    while true; do
        if detect_usb; then
            show_success "Detected: $USB_VOLUME"
            return 0
        fi
        sleep 1
    done
}

# ============================================================================
# CACHE MANAGEMENT
# ============================================================================
cache_empty() {
    [[ ! -d "$CACHE_DIR" ]] || [[ -z "$(ls -A "$CACHE_DIR"/*.wav 2>/dev/null)" ]]
}

refresh_cache() {
    local TEMP_SCRIPT
    TEMP_SCRIPT=$(mktemp /tmp/tesla-download.XXXXXX.sh)
    
    cat > "$TEMP_SCRIPT" << 'DOWNLOAD_EOF'
#!/bin/bash
BASE_URL="https://www.notateslaapp.com"
PAGE_URL="${BASE_URL}/tesla-custom-lock-sounds/"
CACHE_DIR="./locksounds"

paths=$(curl -s "$PAGE_URL" | htmlq 'a.download' --attribute href | grep '\.wav$' | sort -u)

if [ -z "$paths" ]; then
    echo "Error: No sounds found. Site may have changed." >&2
    exit 1
fi

mkdir -p "$CACHE_DIR"
cd "$CACHE_DIR" || exit 1

new_count=0
while IFS= read -r path; do
    file=$(basename "$path")
    if [ ! -f "$file" ]; then
        full_url="${BASE_URL}${path}"
        if curl -sf -O "$full_url"; then
            echo "Downloaded $file"
            ((new_count++))
        fi
    fi
done <<< "$paths"

total=$(ls -1 *.wav 2>/dev/null | wc -l | xargs)
echo ""
echo "✓ Cache: $total sounds ($new_count new)"
DOWNLOAD_EOF
    
    chmod +x "$TEMP_SCRIPT"
    gum spin --spinner dot --title "Downloading sounds from notateslaapp.com..." --show-output -- bash "$TEMP_SCRIPT"
    rm -f "$TEMP_SCRIPT"
    sleep 1
}

# ============================================================================
# SOUND HELPERS
# ============================================================================

# Get all sound names (without .wav extension)
get_all_sounds() {
    local sounds=""
    for f in "$CACHE_DIR"/*.wav; do
        [[ -f "$f" ]] && sounds+="$(basename "${f%.wav}")"$'\n'
    done
    echo "${sounds%$'\n'}"
}

# Extract category from sound name (prefix before first underscore)
get_category() {
    local sound="$1"
    echo "${sound%%_*}"
}

# Get unique categories sorted by name
get_categories() {
    local categories=""
    for f in "$CACHE_DIR"/*.wav; do
        if [[ -f "$f" ]]; then
            local name
            name=$(basename "${f%.wav}")
            local cat="${name%%_*}"
            categories+="$cat"$'\n'
        fi
    done
    echo "$categories" | sort -u
}

# Get sounds in a specific category
get_sounds_in_category() {
    local category="$1"
    local sounds=""
    for f in "$CACHE_DIR"/*.wav; do
        if [[ -f "$f" ]]; then
            local name
            name=$(basename "${f%.wav}")
            local cat="${name%%_*}"
            if [[ "$cat" == "$category" ]]; then
                sounds+="$name"$'\n'
            fi
        fi
    done
    echo "${sounds%$'\n'}"
}

# ============================================================================
# SOUND SELECTION & PREVIEW
# ============================================================================
select_sound() {
    if cache_empty; then
        show_error "Cache is empty. Refresh first."
        return 1
    fi
    
    # Build sound list safely (handles special chars in filenames)
    local sounds=""
    for f in "$CACHE_DIR"/*.wav; do
        [[ -f "$f" ]] && sounds+="$(basename "${f%.wav}")"$'\n'
    done
    sounds="${sounds%$'\n'}"
    
    # Quick search first
    local search_term
    search_term=$(gum input \
        --placeholder "Search (or press Enter to browse all)..." \
        --prompt "⚡ " \
        --prompt.foreground "$RED" \
        --width 50)
    
    local filtered_sounds="$sounds"
    if [[ -n "$search_term" ]]; then
        filtered_sounds=$(echo "$sounds" | grep -i "$search_term" || true)
        if [[ -z "$filtered_sounds" ]]; then
            show_error "No sounds matching '$search_term'"
            return 1
        fi
    fi
    
    local selected
    selected=$(echo "$filtered_sounds" | gum choose \
        --header "$(gum style --foreground $CYAN '⚡ Select a sound')" \
        --cursor "▸ " \
        --cursor.foreground "$RED" \
        --height 15)
    
    if [[ -n "$selected" ]]; then
        SELECTED_SOUND="${selected}.wav"
        show_success "Selected: $SELECTED_SOUND"
        
        # Auto-preview
        if gum confirm "Preview this sound?"; then
            preview_sound
        fi
    fi
}

preview_sound() {
    if [[ -z "$SELECTED_SOUND" ]]; then
        show_error "No sound selected"
        return 1
    fi
    
    local sound_path="$CACHE_DIR/$SELECTED_SOUND"
    if [[ ! -f "$sound_path" ]]; then
        show_error "Sound file not found"
        return 1
    fi
    
    # Kill any existing preview
    [[ -n "$PREVIEW_PID" ]] && kill "$PREVIEW_PID" 2>/dev/null || true
    
    gum style --foreground "$CYAN" "▶ Playing: $SELECTED_SOUND"
    afplay "$sound_path" &
    PREVIEW_PID=$!
    
    # Wait for playback or user interrupt
    wait "$PREVIEW_PID" 2>/dev/null || true
    PREVIEW_PID=""
}

browse_and_preview() {
    if cache_empty; then
        show_error "Cache is empty. Refresh first."
        return 1
    fi
    
    while true; do
        show_header
        show_status
        
        # Main browse menu
        local mode
        mode=$(gum choose \
            --header "$(gum style --foreground $CYAN '⚡ How would you like to find a sound?')" \
            --cursor "▸ " \
            --cursor.foreground "$RED" \
            "Quick preview mode" \
            "Search by name" \
            "Browse by category" \
            "Browse all sounds" \
            "← Back to main menu")
        
        case "$mode" in
            "← Back to main menu"|"")
                return 0
                ;;
            "Quick preview mode")
                quick_preview_mode
                ;;
            "Search by name")
                browse_search
                ;;
            "Browse by category")
                browse_category
                ;;
            "Browse all sounds")
                browse_all
                ;;
        esac
        
        # If a sound was selected, we're done
        [[ -n "$SELECTED_SOUND" ]] && return 0
    done
}

# Quick preview mode - fast audition loop
quick_preview_mode() {
    local all_sounds last_played=""
    all_sounds=$(get_all_sounds)
    
    gum style --foreground "$GRAY" --margin "0 2" \
        "Quick Preview: Select sounds to hear them. Press Esc when done."
    echo ""
    sleep 1
    
    while true; do
        local selected
        selected=$(echo "$all_sounds" | gum choose \
            --header "$(gum style --foreground $CYAN '⚡ Quick Preview (Esc to finish)')" \
            --cursor "▸ " \
            --cursor.foreground "$RED" \
            --height 15)
        
        # User pressed Esc or cancelled
        if [[ -z "$selected" ]]; then
            break
        fi
        
        last_played="$selected"
        local sound_path="$CACHE_DIR/${selected}.wav"
        
        if [[ -f "$sound_path" ]]; then
            gum style --foreground "$GREEN" "▶ $selected"
            afplay "$sound_path"
        fi
        
        # Loop back to selection immediately
    done
    
    # After exiting, ask if they want to use the last played sound
    if [[ -n "$last_played" ]]; then
        echo ""
        if gum confirm "Use '$last_played' as your lock sound?"; then
            SELECTED_SOUND="${last_played}.wav"
            show_success "Selected: $SELECTED_SOUND"
        fi
    fi
}

# Search by name flow
browse_search() {
    local search_term
    search_term=$(gum input \
        --placeholder "Enter search term..." \
        --prompt "🔍 " \
        --prompt.foreground "$CYAN" \
        --width 50)
    
    [[ -z "$search_term" ]] && return 0
    
    # Filter sounds
    local all_sounds filtered_sounds
    all_sounds=$(get_all_sounds)
    filtered_sounds=$(echo "$all_sounds" | grep -i "$search_term" || true)
    
    if [[ -z "$filtered_sounds" ]]; then
        show_error "No sounds matching '$search_term'"
        return 0
    fi
    
    local count
    count=$(echo "$filtered_sounds" | wc -l | tr -d ' ')
    
    # Let user choose from filtered results
    local selected
    selected=$(echo "$filtered_sounds" | gum choose \
        --header "$(gum style --foreground $CYAN "Found $count matches for '$search_term'")" \
        --cursor "▸ " \
        --cursor.foreground "$RED" \
        --height 15)
    
    [[ -z "$selected" ]] && return 0
    
    # Preview and confirm flow
    preview_and_confirm "$selected"
}

# Browse by category flow
browse_category() {
    local categories
    categories=$(get_categories)
    
    # Show category chooser
    local category
    category=$(echo "$categories" | gum choose \
        --header "$(gum style --foreground $CYAN '⚡ Select a category')" \
        --cursor "▸ " \
        --cursor.foreground "$RED" \
        --height 15)
    
    [[ -z "$category" ]] && return 0
    
    # Get sounds in this category
    local sounds
    sounds=$(get_sounds_in_category "$category")
    
    local count
    count=$(echo "$sounds" | wc -l | tr -d ' ')
    
    # Show sounds in category
    local selected
    selected=$(echo "$sounds" | gum choose \
        --header "$(gum style --foreground $CYAN "$category ($count sounds)")" \
        --cursor "▸ " \
        --cursor.foreground "$RED" \
        --height 15)
    
    [[ -z "$selected" ]] && return 0
    
    # Preview and confirm flow
    preview_and_confirm "$selected"
}

# Browse all sounds flow
browse_all() {
    local all_sounds
    all_sounds=$(get_all_sounds)
    
    local selected
    selected=$(echo "$all_sounds" | gum choose \
        --header "$(gum style --foreground $CYAN '⚡ All sounds (scroll to browse)')" \
        --cursor "▸ " \
        --cursor.foreground "$RED" \
        --height 15)
    
    [[ -z "$selected" ]] && return 0
    
    # Preview and confirm flow
    preview_and_confirm "$selected"
}

# Preview sound and ask for confirmation
preview_and_confirm() {
    local sound_name="$1"
    local sound_file="${sound_name}.wav"
    local sound_path="$CACHE_DIR/$sound_file"
    
    if [[ ! -f "$sound_path" ]]; then
        show_error "Sound file not found"
        return 1
    fi
    
    while true; do
        echo ""
        gum style --foreground "$GREEN" "▶ Playing: $sound_name"
        
        # Play sound (blocking - let it complete)
        afplay "$sound_path"
        
        echo ""
        local action
        action=$(gum choose \
            --header "$(gum style --foreground $CYAN "What would you like to do?")" \
            --cursor "▸ " \
            --cursor.foreground "$RED" \
            "Use this sound" \
            "Play again" \
            "Pick a different sound")
        
        case "$action" in
            "Use this sound")
                SELECTED_SOUND="$sound_file"
                show_success "Selected: $SELECTED_SOUND"
                return 0
                ;;
            "Play again")
                continue
                ;;
            "Pick a different sound"|"")
                return 0
                ;;
        esac
    done
}

# ============================================================================
# USB OPERATIONS
# ============================================================================
install_to_usb() {
    if [[ -z "$SELECTED_SOUND" ]]; then
        show_error "No sound selected. Browse sounds first."
        return 1
    fi
    
    if [[ -z "$USB_VOLUME" || ! -d "$USB_VOLUME" ]]; then
        gum style --foreground "$CYAN" "USB not connected."
        if gum confirm "Wait for USB?"; then
            wait_for_usb
        else
            return 1
        fi
    fi
    
    local source_file="$CACHE_DIR/$SELECTED_SOUND"
    local dest_file="$USB_VOLUME/LockChime.wav"
    
    if [[ ! -f "$source_file" ]]; then
        show_error "Source file not found: $SELECTED_SOUND"
        return 1
    fi
    
    echo ""
    gum style --border rounded --border-foreground "$CYAN" --padding "1 2" --margin "0 2" \
        "$(gum style --foreground $WHITE --bold 'Ready to install:')" \
        "" \
        "  Sound:  $(gum style --foreground $GREEN "$SELECTED_SOUND")" \
        "  USB:    $(gum style --foreground $GREEN "$(basename "$USB_VOLUME")")" \
        "  Target: $(gum style --foreground $GRAY "LockChime.wav")"
    echo ""
    
    # Check for existing
    if [[ -f "$dest_file" ]]; then
        gum style --foreground "$GRAY" --margin "0 2" "⚠ Existing LockChime.wav will be backed up"
    fi
    
    if ! gum confirm "Install to USB?"; then
        return 1
    fi
    
    # Backup existing if present
    if [[ -f "$dest_file" ]]; then
        local backup_name="LockChime_backup_$(date +%Y%m%d_%H%M%S).wav"
        mv "$dest_file" "$USB_VOLUME/$backup_name"
        gum style --foreground "$GRAY" "  Backed up to: $backup_name"
    fi
    
    # Copy and rename
    if cp "$source_file" "$dest_file"; then
        echo ""
        gum style \
            --border double \
            --border-foreground "$GREEN" \
            --padding "1 2" \
            --margin "0 2" \
            --foreground "$GREEN" \
            --bold \
            "✓ INSTALLED SUCCESSFULLY" \
            "" \
            "$(gum style --foreground $WHITE "Next steps:")" \
            "  1. Eject USB safely" \
            "  2. Plug into Tesla glovebox" \
            "  3. Go to Toybox → Boombox → Lock Sound → USB"
        echo ""
        
        if gum confirm "Eject USB now?"; then
            eject_usb
        fi
    else
        show_error "Failed to copy file"
        return 1
    fi
}

eject_usb() {
    if [[ -z "$USB_VOLUME" || ! -d "$USB_VOLUME" ]]; then
        show_error "No USB to eject"
        return 1
    fi
    
    local vol_name
    vol_name=$(basename "$USB_VOLUME")
    
    if diskutil eject "$USB_VOLUME" 2>/dev/null; then
        show_success "Ejected $vol_name - Safe to remove!"
        USB_VOLUME=""
    else
        show_error "Failed to eject. Try manually."
    fi
}

# ============================================================================
# MAIN MENU
# ============================================================================
main_menu() {
    while true; do
        show_header
        show_status
        
        local choices="Browse & Preview Sounds
Install to USB"
        
        [[ -n "$USB_VOLUME" && -d "$USB_VOLUME" ]] && choices="$choices
Eject USB"
        
        choices="$choices
Refresh Sound Cache
Detect USB Drive
Exit"
        
        local choice
        choice=$(echo "$choices" | gum choose \
            --header "$(gum style --foreground $RED '─── MAIN MENU ───')" \
            --cursor "⚡ " \
            --cursor.foreground "$RED" \
            --selected.foreground "$WHITE" \
            --selected.bold)
        
        case "$choice" in
            "Browse & Preview Sounds")
                browse_and_preview
                ;;
            "Install to USB")
                install_to_usb
                ;;
            "Eject USB")
                eject_usb
                ;;
            "Refresh Sound Cache")
                refresh_cache
                ;;
            "Detect USB Drive")
                if detect_usb; then
                    show_success "Found: $USB_VOLUME"
                else
                    show_error "No USB detected"
                    if gum confirm "Wait for USB?"; then
                        wait_for_usb
                    fi
                fi
                ;;
            "Exit"|"")
                echo ""
                gum style --foreground "$GRAY" --italic "  Thanks for using Tesla Lock Sound Loader!"
                echo ""
                exit 0
                ;;
        esac
    done
}

# ============================================================================
# MAIN ENTRY
# ============================================================================
main() {
    check_deps
    
    # Initial cache check
    if cache_empty; then
        show_header
        gum style --foreground "$CYAN" --margin "0 2" "No sounds cached yet."
        if gum confirm "Download sounds now?"; then
            refresh_cache
        else
            show_error "Cannot continue without sounds."
            exit 1
        fi
    fi
    
    # Try to auto-detect USB (silent on startup)
    detect_usb --silent
    
    # Enter main menu
    main_menu
}

main "$@"