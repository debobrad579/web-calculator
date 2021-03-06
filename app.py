from flask import Flask, render_template, jsonify, request
from cmath import log, sqrt, pi, e

i = 1j

app = Flask(__name__, static_folder='static')

basically_int = lambda x: int(x) if int(x) - 0.000001 < x < int(x) + 0.000001 else x


def format_complex(func):
    def wrapper(x, round_digits=None):
        result = func(x)

        if isinstance(result, float):
            return round(result, round_digits) if round_digits is not None else result

        if isinstance(result, (int, float)) and result >= 1000000000:
            return "{:.12e}".format(result)

        if not isinstance(result, complex):
            return result

        real = basically_int(result.real)
        imag = basically_int(result.imag)

        if round_digits is not None:
            real = round(real, round_digits)
            imag = round(imag, round_digits)

        if imag == 0:
            return real
        
        if real == 0:
            return imag * 1j

        return real + imag * 1j
    
    return wrapper


sin = format_complex(lambda x: 0.5 * i * e ** (-i * x) - 0.5 * i * e ** (i * x))
cos = format_complex(lambda x: 0.5 * e ** (-i * x) + 0.5 * e ** (i * x))
tan = format_complex(lambda x: sin(x) / cos(x))
sinh = format_complex(lambda x: (e ** x - e ** (-x)) / 2)
cosh = format_complex(lambda x: (e ** x + e ** (-x)) / 2)
tanh = format_complex(lambda x: sinh(x) / cosh(x))
asin = format_complex(lambda x: -i * log(i * x + sqrt(1 - x ** 2)))
acos = format_complex(lambda x: pi / 2 - asin(x))
atan = format_complex(lambda x: i * log(i * x + sqrt(1 - x ** 2)))
asinh = format_complex(lambda x: i * log(x + sqrt(x ** 2 + 1)))
acosh = format_complex(lambda x: i * log(x + sqrt(x ** 2 - 1)))
atanh = format_complex(lambda x: i * log((1 + x) / (1 - x)))
factorial = lambda x: 1 if x == 0 else x * factorial(x - 1)


@format_complex
def solve(equation, round_digits=None):
    try:
        return eval(equation.replace("^", "**").replace("÷", "/").replace("π", "pi").replace("Ψ", "+"))
    except Exception as error:
        return error


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api", methods=["GET"])
def api_all():
    if request.args.get("equation"):
        equation = request.args.get("equation")
        result = solve(equation, 12)

        if isinstance(result, Exception):
            return jsonify({
                "equation": str(result),
                "is_error": True
            })

        return jsonify({
            "equation": str(result).replace("j", "i").replace("e+", "e").replace("e", "ᴇ"),
            "is_error": False
        })


if __name__ == "__main__":
    app.run(debug=True)
