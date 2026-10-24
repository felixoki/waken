SOURCE = "shadow_wanderer"
TARGET = "grandmother"
SHEETS = ["idle", "walking", "dashing", "casting"]

CLOAK = [0x3A3346, 0x524862, 0x6C6280, 0x877C98, 0xA49AB2, 0xC2BACB, 0xDCD6E0]


def rgb(c):
    return ((c >> 16) & 255, (c >> 8) & 255, c & 255)


def pick(ramp, t):
    return rgb(ramp[max(0, min(len(ramp) - 1, round(t * (len(ramp) - 1))))])


def remap(r, g, b, a):
    if a < 255:
        return None
    if b <= r + 10:
        return None
    lum = 0.299 * r + 0.587 * g + 0.114 * b
    return pick(CLOAK, (lum - 15) / 140) + (a,)
