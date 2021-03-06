import sys
import time
from threading import Thread
import functools
import re


def timeout(timeout_deco):
    def deco(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            res = [TimeoutError()]

            def newFunc():
                try:
                    res[0] = func(*args, **kwargs)
                except Exception as e:
                    res[0] = e
            t = Thread(target=newFunc)
            t.daemon = True
            try:
                t.start()
                t.join(timeout_deco/1000)
            except Exception as je:
                raise je
            ret = res[0]
            if isinstance(ret, BaseException):
                raise ret
            return ret
        return wrapper
    return deco


def split_array_value(array_value):
    if ',' in array_value:
        array = re.split(',\s*', array_value)
        for index in range(len(array)):
            array[index] = re.sub('\\[|\\]|\'|\"','',array[index])
        return array
    else:
        return []

def boolean_value_to_python_boolean(boolean_value):
    if boolean_value == 'true':
        return True
    else:
        return False

def argv_to_python_code(data_type_and_value):
    data_type, value = data_type_and_value.split(':')
    if data_type == 'boolean':
        value = boolean_value_to_python_boolean(value)
    elif data_type == 'string':
        value = str(value).replace("\"", '')
    elif data_type == 'long' or data_type == 'integer':
        value = int(value)
    elif data_type == 'double':
        value = float(value)
    elif data_type == 'integerArray' or data_type == 'longArray':
        value = list(map(int, split_array_value(value)))
    elif data_type == 'booleanArray':
        value = list(map(boolean_value_to_python_boolean, split_array_value(value)))
    elif data_type == 'doubleArray':
        value = list(map(float, split_array_value(value)))
    elif data_type == 'stringArray':
        value = split_array_value(value)
    return value

if __name__ == '__main__':
    codeExpertParametersPython = [argv_to_python_code(parameter) for parameter in sys.argv[2:len(sys.argv)-1]]
    codeExpertFormattedInput = str(codeExpertParametersPython)[1:-1]
    codeExpertAnswerPython = sys.argv[-1]
    codeExpertAnswerPython = argv_to_python_code(codeExpertAnswerPython)
    solution = timeout(int(sys.argv[1]))(solution)
    try:
        start_time = time.monotonic()
        user_answer = solution(*codeExpertParametersPython)
        end_time = time.monotonic()
        time_elapsed = round((end_time - start_time)*1000, 2)
        if codeExpertAnswerPython == user_answer:
            print('\n$answer|')
        else:
            print('\n$notAnswer|')
        print('\n$expected|'+str(codeExpertAnswerPython))
        print('\n$actual|'+str(user_answer))
        print('\n$input|'+codeExpertFormattedInput)
        print('\n$time|'+str(time_elapsed))
    except TimeoutError as toe:
        print('\n$timeout|', file=sys.stderr)
    except Exception as e:
        print(e, file=sys.stderr)
