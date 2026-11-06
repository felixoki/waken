SOURCE = "troll"
TARGET = "bog_troll"
SHEETS = ["idle", "walking", "running", "slashing", "throwing"]

SKIN = [0x1C2A20, 0x283A2B, 0x344A35, 0x435C40, 0x56704D, 0x6C845E, 0x86996F]


def rgb(c):
    return ((c >> 16) & 255, (c >> 8) & 255, c & 255)


def pick(ramp, t):
    return rgb(ramp[max(0, min(len(ramp) - 1, round(t * (len(ramp) - 1))))])


def remap(r, g, b, a):
    if a < 255:
        return None
    if abs(r - g) > 22 or b > g - 14:
        return None
    lum = 0.299 * r + 0.587 * g + 0.114 * b
    return pick(SKIN, (lum - 34) / 98) + (a,)
